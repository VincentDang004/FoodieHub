const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME || "foodapp",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "",
  
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    dialect: "mysql",
    logging: false
  }
);

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: true },
    email: { type: DataTypes.STRING(100), allowNull: true },
    password: { type: DataTypes.STRING(255), allowNull: true },
    role: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "user" }
  },
  { tableName: "users", timestamps: false }
);

const Order = sequelize.define(
  "Order",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    subtotal: { type: DataTypes.FLOAT, allowNull: true },
    voucher_code: { type: DataTypes.STRING(50), allowNull: true },
    discount_percent: { type: DataTypes.FLOAT, allowNull: true },
    discount_amount: { type: DataTypes.FLOAT, allowNull: true },
    total: { type: DataTypes.FLOAT, allowNull: true },
    shipping_address: { type: DataTypes.STRING(255), allowNull: true },
    status: { type: DataTypes.STRING(50), allowNull: true },
    payment_method: { type: DataTypes.STRING(30), allowNull: true },
    payment_requested_at: { type: DataTypes.DATE, allowNull: true },
    payment_expires_at: { type: DataTypes.DATE, allowNull: true },
    payment_expired_at: { type: DataTypes.DATE, allowNull: true },
    approved_at: { type: DataTypes.DATE, allowNull: true },
    rejected_at: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: true }
  },
  { tableName: "orders", timestamps: false }
);

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    food_id: { type: DataTypes.INTEGER, allowNull: true },
    food_name: { type: DataTypes.STRING(255), allowNull: false },
    price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    image: { type: DataTypes.STRING(500), allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: true }
  },
  { tableName: "order_items", timestamps: false }
);

const Food = sequelize.define(
  "Food",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: true },
    price: { type: DataTypes.FLOAT, allowNull: true },
    image: { type: DataTypes.STRING(255), allowNull: true },
    category_id: { type: DataTypes.INTEGER, allowNull: true },
    restaurant_id: { type: DataTypes.INTEGER, allowNull: true }
  },
  { tableName: "foods", timestamps: false }
);

const Category = sequelize.define(
  "Category",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: true }
  },
  { tableName: "categories", timestamps: false }
);

const Restaurant = sequelize.define(
  "Restaurant",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: true },
    address: { type: DataTypes.STRING(255), allowNull: true }
  },
  { tableName: "restaurants", timestamps: false }
);

const Address = sequelize.define(
  "Address",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    address: { type: DataTypes.STRING(255), allowNull: true }
  },
  { tableName: "addresses", timestamps: false }
);

const Cart = sequelize.define(
  "Cart",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: true }
  },
  { tableName: "carts", timestamps: false }
);

const CartItem = sequelize.define(
  "CartItem",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    cart_id: { type: DataTypes.INTEGER, allowNull: true },
    food_id: { type: DataTypes.INTEGER, allowNull: true },
    quantity: { type: DataTypes.INTEGER, allowNull: true }
  },
  { tableName: "cart_items", timestamps: false }
);

const OrderDetail = sequelize.define(
  "OrderDetail",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    order_id: { type: DataTypes.INTEGER, allowNull: true },
    food_id: { type: DataTypes.INTEGER, allowNull: true },
    quantity: { type: DataTypes.INTEGER, allowNull: true }
  },
  { tableName: "order_details", timestamps: false }
);

const Payment = sequelize.define(
  "Payment",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    order_id: { type: DataTypes.INTEGER, allowNull: true },
    method: { type: DataTypes.STRING(50), allowNull: true },
    status: { type: DataTypes.STRING(50), allowNull: true },
    note: { type: DataTypes.STRING(255), allowNull: true },
    requested_at: { type: DataTypes.DATE, allowNull: true },
    reviewed_at: { type: DataTypes.DATE, allowNull: true }
  },
  { tableName: "payments", timestamps: false }
);

const Review = sequelize.define(
  "Review",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    food_id: { type: DataTypes.INTEGER, allowNull: true },
    rating: { type: DataTypes.INTEGER, allowNull: true },
    comment: { type: DataTypes.TEXT, allowNull: true },
    admin_reply: { type: DataTypes.TEXT, allowNull: true },
    admin_replied_at: { type: DataTypes.DATE, allowNull: true }
  },
  { tableName: "reviews", timestamps: false }
);

const Voucher = sequelize.define(
  "Voucher",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    code: { type: DataTypes.STRING(50), allowNull: true },
    discount: { type: DataTypes.FLOAT, allowNull: true }
  },
  { tableName: "vouchers", timestamps: false }
);

Order.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Order, { foreignKey: "user_id" });
Order.hasMany(OrderItem, { foreignKey: "order_id" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });

Address.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Address, { foreignKey: "user_id" });

Cart.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Cart, { foreignKey: "user_id" });
Cart.hasMany(CartItem, { foreignKey: "cart_id" });
CartItem.belongsTo(Cart, { foreignKey: "cart_id" });
CartItem.belongsTo(Food, { foreignKey: "food_id" });
Food.hasMany(CartItem, { foreignKey: "food_id" });

OrderDetail.belongsTo(Order, { foreignKey: "order_id" });
Order.hasMany(OrderDetail, { foreignKey: "order_id" });
OrderDetail.belongsTo(Food, { foreignKey: "food_id" });
Food.hasMany(OrderDetail, { foreignKey: "food_id" });

Food.belongsTo(Category, { foreignKey: "category_id" });
Category.hasMany(Food, { foreignKey: "category_id" });

Food.belongsTo(Restaurant, { foreignKey: "restaurant_id" });
Restaurant.hasMany(Food, { foreignKey: "restaurant_id" });

Payment.belongsTo(Order, { foreignKey: "order_id" });
Order.hasMany(Payment, { foreignKey: "order_id" });

Review.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Review, { foreignKey: "user_id" });
Review.belongsTo(Food, { foreignKey: "food_id" });
Food.hasMany(Review, { foreignKey: "food_id" });

module.exports = {
  sequelize,
  models: {
    User,
    Order,
    OrderItem,
    Food,
    Category,
    Restaurant,
    Address,
    Cart,
    CartItem,
    OrderDetail,
    Payment,
    Review,
    Voucher
  }
};
