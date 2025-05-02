const formidable = require("formidable").IncomingForm;
const fs = require("fs");
const _ = require("lodash");
const { Product, validate } = require("../models/product");
const { Category } = require("../models/category");
const mongoose = require("mongoose");

module.exports.createProduct = async (req, res) => {
  const form = new formidable({ keepExtensions: true, multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).send("Form parse failed");
    }

    const cleanFields = {
      name: String(fields.name),
      description: String(fields.description),
      price: Number(fields.price),
      quantity: Number(fields.quantity),
      category: String(fields.category),
    };

    const { error } = validate(cleanFields);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    // Get the photo correctly
    let photo = null;
    if (files.photo) {
      photo = Array.isArray(files.photo) ? files.photo[0] : files.photo;
    }

    if (!photo || !photo.filepath) {
      return res.status(400).send("No photo provided!");
    }

    try {
      const product = new Product(cleanFields);

      const data = fs.readFileSync(photo.filepath);
      product.photo.data = data;
      product.photo.contentType = photo.mimetype;

      await product.save();

      return res.status(201).send({
        message: "Product created successfully",
        product: _.pick(product, ["_id", "name", "description", "price", "category", "quantity"]),
      });
    } catch (err) {
      console.error("Error saving product:", err);
      return res.status(500).send("Error saving product");
    }
  });
};

module.exports.getProducts = async (req, res) => {
  console.log(req.query);

  // Get 'desc' from query params, defaulting to 1 for descending
  let order = req.query.order === "desc" ? -1 : 1;
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  let limit = req.query.limit ? parseInt(req.query.limit) : 10;

  try {
    const products = await Product.find()
      .select({ photo: 0 })
      .populate("category", "name createdAt")
      .sort({ [sortBy]: order })
      .limit(limit);

    return res.status(200).send(products);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
};

module.exports.getProductById = async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId).select({ photo: 0 }).populate("category");
  if (!product) return res.status(404).send("Not Found");
  return res.status(200).send(product);
};

module.exports.getPhoto = async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId).select({ photo: 1, _id: 0 });
  res.set("Content-Type", product.photo.contentType0);
  if (!product.photo) return res.status(404).send("Not Found");
  return res.status(200).send(product.photo.data);
};

module.exports.updateProductById = async (req, res) => {
  const productId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).send("Invalid Product ID");
  }

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).send("Product not found");

    const form = new formidable({ keepExtensions: true, multiples: false });

    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(400).send("Form parsing error");

      // Validate and clean fields before assignment
      const updatedFields = {
        name: Array.isArray(fields.name) ? fields.name[0] : fields.name,
        description: Array.isArray(fields.description) ? fields.description[0] : fields.description,
        // Validate price and quantity
        price: !isNaN(Number(fields.price)) ? Number(fields.price) : product.price,
        quantity: !isNaN(Number(fields.quantity)) ? Number(fields.quantity) : product.quantity,
        category: Array.isArray(fields.category) ? fields.category[0] : fields.category,
      };

      // Ensure category is provided and valid
      if (!updatedFields.category) {
        return res.status(400).send("Category is required.");
      }

      _.assign(product, updatedFields);

      try {
        // Check if a new photo is uploaded
        if (files.photo) {
          const file = Array.isArray(files.photo) ? files.photo[0] : files.photo;
          if (file.filepath) {
            const data = await fs.readFile(file.filepath);
            product.photo.data = data;
            product.photo.contentType = file.mimetype;
          }
        }

        // Save updated product
        await product.save();
        return res.status(200).send({ message: "Product Updated Successfully!" });
      } catch (saveError) {
        console.error("Save error:", saveError);
        return res.status(500).send("Failed to update product: " + saveError.message);
      }
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    return res.status(500).send("Server error: " + error.message);
  }
};

module.exports.filterProducts = async (req, res) => {
  let order = req.body.order === "desc" ? -1 : 1;
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? parseInt(req.body.limit) : 10;
  let skip = parseInt(req.body.skip);

  const products = await Product.find()
    .select({ photo: 0 })
    .populate("category", "name")
    .sort({ [sortBy]: order })
    .skip(skip)
    .limit(limit);
  return res.status(200).send(products);
};

module.exports.getCategoryByProduct = async (req, res) => {
  const categoryId = req.params.id;

  // Check if category exists
  const category = await Category.findById(categoryId);
  if (!category) return res.status(404).send("Category Not Found");

  // Find products under that category
  const products = await Product.find({ category: categoryId }).select({ photo: 0 }).populate("category");

  if (products.length === 0) return res.status(404).send("No Products Found");

  return res.status(200).send(products);
};
