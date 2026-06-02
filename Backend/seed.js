/**
 * Seed script — creates 1 vendor user, 15 restaurants, and 10 products per restaurant.
 * Run once:  node seed.js
 */

import { connect, disconnect } from "mongoose";
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/userModel.js";
import Restaurant from "./models/restaurantModel.js";
import Product from "./models/productModel.js";

config();

// ─── Unsplash image helper ────────────────────────────────────────────────────
const img = (id) =>
  `https://images.unsplash.com/photo-${id}?w=400&auto=format&fit=crop&q=80`;
const rImg = (id) =>
  `https://images.unsplash.com/photo-${id}?w=600&auto=format&fit=crop&q=80`;

// ─── 15 Restaurants ──────────────────────────────────────────────────────────
const RESTAURANTS = [
  // 1 ─────────────────────────────────────────────────────────────────────────
  {
    name: "Spice Garden",
    location: "Connaught Place, Delhi",
    category: ["veg", "non-veg"],
    variety: ["north-indian"],
    offer: "20% off on orders above ₹500",
    image: rImg("1585937421612-70a008356fbe"),
    rating: 4.5,
    products: [
      { name: "Butter Chicken",    description: "Creamy tomato-based chicken curry simmered with aromatic spices",   price: 280, category: "Chicken",  imageUrl: img("1603894584373-5ac82b2ae398") },
      { name: "Paneer Tikka",      description: "Smoky grilled cottage cheese cubes marinated in spiced yogurt",     price: 220, category: "Veg",      imageUrl: img("1606491956689-2ea866880c84") },
      { name: "Dal Makhani",       description: "Slow-cooked black lentils in rich buttery tomato gravy",           price: 180, category: "Veg",      imageUrl: img("1505253758473-96b7015fcd40") },
      { name: "Chicken Biryani",   description: "Fragrant basmati rice layered with spiced tender chicken",         price: 320, category: "Biryani",  imageUrl: img("1563379091339-03b21ab4a4f8") },
      { name: "Garlic Naan",       description: "Soft leavened flatbread brushed with garlic herb butter",          price: 60,  category: "Bread",    imageUrl: img("1565557623262-b51c2513a641") },
      { name: "Samosa (2 pcs)",    description: "Crispy pastry pockets stuffed with spiced potatoes and peas",      price: 60,  category: "Snack",    imageUrl: img("1601050690597-df0568f70950") },
      { name: "Chole Bhature",     description: "Spiced white chickpea curry served with fluffy fried bread",       price: 150, category: "Veg",      imageUrl: img("1626132527686-4cfc148c1a13") },
      { name: "Mango Lassi",       description: "Chilled sweet yogurt drink blended with fresh ripe mango",        price: 90,  category: "Drink",    imageUrl: img("1553361371-9b09328b3c15") },
      { name: "Gulab Jamun",       description: "Soft milk-solid dumplings soaked in rose-scented sugar syrup",    price: 80,  category: "Dessert",  imageUrl: img("1581954548122-1b67af55ba7b") },
      { name: "Tandoori Chicken",  description: "Half chicken marinated overnight, roasted in a clay tandoor",     price: 350, category: "Chicken",  imageUrl: img("1599487488170-d11ec9c172f0") },
    ],
  },
  // 2 ─────────────────────────────────────────────────────────────────────────
  {
    name: "Dragon Palace",
    location: "Bandra, Mumbai",
    category: ["veg", "non-veg"],
    variety: ["chinese"],
    offer: "Free spring rolls on orders above ₹400",
    image: rImg("1563245372-f21724e3856d"),
    rating: 4.2,
    products: [
      { name: "Veg Fried Rice",        description: "Wok-tossed jasmine rice with crunchy vegetables and soy sauce",   price: 160, category: "Rice",    imageUrl: img("1603133872878-684f208fb84b") },
      { name: "Chicken Manchurian",    description: "Crispy chicken balls in tangy Chinese-style Manchurian sauce",    price: 220, category: "Chicken", imageUrl: img("1603894584373-5ac82b2ae398") },
      { name: "Hakka Noodles",         description: "Hand-pulled noodles tossed with vegetables in dark soy sauce",    price: 180, category: "Noodles", imageUrl: img("1569718212165-3a8278d5f624") },
      { name: "Steamed Momos (6 pcs)", description: "Delicate dumplings filled with spiced chicken and vegetables",   price: 140, category: "Snack",   imageUrl: img("1534422298391-e4f8c172dddb") },
      { name: "Veg Spring Rolls",      description: "Golden crispy rolls stuffed with cabbage and shredded veggies",  price: 120, category: "Snack",   imageUrl: img("1563245372-f21724e3856d") },
      { name: "Hot & Sour Soup",       description: "Tangy peppery broth loaded with mushrooms and silken tofu",      price: 110, category: "Soup",    imageUrl: img("1547592166-23ac45744acd") },
      { name: "Schezwan Fried Rice",   description: "Spicy wok-fried rice with Schezwan chutney and mixed veggies",   price: 190, category: "Rice",    imageUrl: img("1603133872878-684f208fb84b") },
      { name: "Honey Chili Potato",    description: "Crispy potato strips glazed in sweet chili honey sauce",         price: 150, category: "Snack",   imageUrl: img("1573080496219-bb964701c2b8") },
      { name: "Chili Chicken (dry)",   description: "Tender chicken bites tossed with bell peppers in chili sauce",   price: 240, category: "Chicken", imageUrl: img("1599487488170-d11ec9c172f0") },
      { name: "Wonton Soup",           description: "Clear broth with pork wontons, spring onion and sesame oil",     price: 130, category: "Soup",    imageUrl: img("1547592166-23ac45744acd") },
    ],
  },
  // 3 ─────────────────────────────────────────────────────────────────────────
  {
    name: "Pizza Paradise",
    location: "Koramangala, Bangalore",
    category: ["veg", "non-veg"],
    variety: ["italian"],
    offer: "Buy 2 pizzas get 1 garlic bread free",
    image: rImg("1574071318508-1cdbab80d002"),
    rating: 4.6,
    products: [
      { name: "Margherita Pizza",    description: "Classic tomato base with fresh mozzarella and basil leaves",          price: 240, category: "Pizza",   imageUrl: img("1574071318508-1cdbab80d002") },
      { name: "Pepperoni Pizza",     description: "Generous pepperoni slices over spicy marinara and melted cheese",     price: 320, category: "Pizza",   imageUrl: img("1565299624946-b28f40a0ae38") },
      { name: "BBQ Chicken Pizza",   description: "Smoky BBQ sauce, grilled chicken and onion on crispy thin crust",    price: 340, category: "Pizza",   imageUrl: img("1574071318508-1cdbab80d002") },
      { name: "Pasta Carbonara",     description: "Al dente spaghetti in creamy egg sauce with crispy pancetta",         price: 280, category: "Pasta",   imageUrl: img("1621996346565-e3dbc646d9a9") },
      { name: "Penne Arrabbiata",    description: "Penne pasta tossed in spicy tomato garlic and chili sauce",           price: 250, category: "Pasta",   imageUrl: img("1621996346565-e3dbc646d9a9") },
      { name: "Garlic Bread (4 pcs)","description": "Toasted baguette brushed with herb garlic butter, oven-baked",      price: 90,  category: "Bread",   imageUrl: img("1476718406336-4b801b173a7e") },
      { name: "Lasagna",             description: "Layered pasta sheets with Bolognese, béchamel and parmesan",         price: 310, category: "Pasta",   imageUrl: img("1621996346565-e3dbc646d9a9") },
      { name: "Tiramisu",            description: "Classic Italian dessert with espresso-soaked ladyfingers",            price: 180, category: "Dessert", imageUrl: img("1571877227200-a0d98ea607e9") },
      { name: "Bruschetta",          description: "Grilled bread topped with fresh tomato, garlic and basil",            price: 120, category: "Snack",   imageUrl: img("1476718406336-4b801b173a7e") },
      { name: "Panna Cotta",         description: "Silky vanilla cream dessert topped with berry coulis",                price: 160, category: "Dessert", imageUrl: img("1571877227200-a0d98ea607e9") },
    ],
  },
  // 4 ─────────────────────────────────────────────────────────────────────────
  {
    name: "South Spice",
    location: "Anna Nagar, Chennai",
    category: ["veg", "non-veg"],
    variety: ["south-indian"],
    offer: "Complimentary filter coffee with every meal",
    image: rImg("1630409351241-e90e7b3e6c28"),
    rating: 4.4,
    products: [
      { name: "Masala Dosa",         description: "Crispy golden crepe filled with spiced potato and served with chutneys", price: 120, category: "Dosa",    imageUrl: img("1630409351241-e90e7b3e6c28") },
      { name: "Plain Idli (3 pcs)",  description: "Fluffy steamed rice cakes served with sambar and coconut chutney",      price: 80,  category: "Idli",    imageUrl: img("1668236543090-82eba5ee5976") },
      { name: "Medu Vada",           description: "Crisp savory doughnuts made from urad dal, served hot with chutney",    price: 90,  category: "Snack",   imageUrl: img("1601050690597-df0568f70950") },
      { name: "Rava Uttapam",        description: "Thick semolina pancake topped with onion, tomato and green chili",      price: 110, category: "Dosa",    imageUrl: img("1630409351241-e90e7b3e6c28") },
      { name: "Pongal",              description: "Soft rice and lentil porridge tempered with ghee, pepper and cashews",  price: 100, category: "Veg",     imageUrl: img("1505253758473-96b7015fcd40") },
      { name: "Pesarattu",           description: "Green moong dal crepe served with ginger chutney and upma",             price: 110, category: "Dosa",    imageUrl: img("1630409351241-e90e7b3e6c28") },
      { name: "Chettinad Chicken",   description: "Fiery Chettinad spice blend slow-cooked with tender chicken pieces",   price: 280, category: "Chicken", imageUrl: img("1599487488170-d11ec9c172f0") },
      { name: "Kerala Fish Curry",   description: "Tangy coconut milk-based fish curry with kudampuli and curry leaves",  price: 300, category: "Seafood", imageUrl: img("1519708227418-1e0f1d7a0d93") },
      { name: "Filter Coffee",       description: "Traditional South Indian drip coffee served in a steel tumbler",        price: 60,  category: "Drink",   imageUrl: img("1510591426687-2c8359c6ac2a") },
      { name: "Payasam",             description: "Creamy vermicelli dessert cooked in milk, sugar and cardamom",          price: 90,  category: "Dessert", imageUrl: img("1581954548122-1b67af55ba7b") },
    ],
  },
  // 5 ─────────────────────────────────────────────────────────────────────────
  {
    name: "Burger Barn",
    location: "Sector 18, Noida",
    category: ["veg", "non-veg"],
    variety: ["american", "fast-food"],
    offer: "Free fries with every burger ordered",
    image: rImg("1568901346375-23c9450c58cd"),
    rating: 4.1,
    products: [
      { name: "Classic Beef Burger",   description: "Juicy beef patty with lettuce, tomato, pickles and cheddar cheese",  price: 220, category: "Burger", imageUrl: img("1568901346375-23c9450c58cd") },
      { name: "Crispy Chicken Burger", description: "Fried chicken thigh with coleslaw, sriracha mayo on a brioche bun",  price: 200, category: "Burger", imageUrl: img("1571091718767-18b5b1457add") },
      { name: "Veggie Garden Burger",  description: "Black bean and quinoa patty with avocado and chipotle sauce",        price: 180, category: "Burger", imageUrl: img("1520072959219-c52fca16a981") },
      { name: "Double Smash Burger",   description: "Twin smash patties with American cheese and secret house sauce",     price: 270, category: "Burger", imageUrl: img("1568901346375-23c9450c58cd") },
      { name: "Loaded Cheese Fries",   description: "Thick-cut fries smothered with cheddar sauce and jalapeños",        price: 130, category: "Snack",  imageUrl: img("1573080496219-bb964701c2b8") },
      { name: "Onion Rings",           description: "Beer-battered onion rings fried golden crispy, with dipping sauce",  price: 110, category: "Snack",  imageUrl: img("1573080496219-bb964701c2b8") },
      { name: "Oreo Milkshake",        description: "Thick creamy milkshake blended with Oreo cookies and vanilla ice cream", price: 160, category: "Drink", imageUrl: img("1572490122132-bb8e251b7ec1") },
      { name: "Hot Dog",               description: "Beef frankfurter in a toasted bun with mustard and ketchup",        price: 150, category: "Snack",  imageUrl: img("1568901346375-23c9450c58cd") },
      { name: "Chicken Wings (6 pcs)", description: "Crispy wings tossed in Buffalo sauce, served with blue cheese dip",  price: 240, category: "Chicken",imageUrl: img("1599487488170-d11ec9c172f0") },
      { name: "Classic Coleslaw",      description: "Creamy shredded cabbage and carrot salad with a hint of vinegar",   price: 60,  category: "Snack",  imageUrl: img("1512621776951-a57141f2eefd") },
    ],
  },
  // 6 ─────────────────────────────────────────────────────────────────────────
  {
    name: "Sushi World",
    location: "Jubilee Hills, Hyderabad",
    category: ["non-veg"],
    variety: ["japanese"],
    offer: "Happy hour 50% off on rolls (6–8 PM)",
    image: rImg("1617196034183-421b4040ed20"),
    rating: 4.7,
    products: [
      { name: "Salmon Nigiri (2 pcs)", description: "Hand-pressed sushi rice topped with fresh Atlantic salmon slices",  price: 220, category: "Sushi",  imageUrl: img("1617196034183-421b4040ed20") },
      { name: "Dragon Roll",           description: "Shrimp tempura inside, avocado and tobiko outside",                 price: 320, category: "Sushi",  imageUrl: img("1617196034183-421b4040ed20") },
      { name: "California Roll",       description: "Crab, avocado and cucumber wrapped in nori and sesame",             price: 260, category: "Sushi",  imageUrl: img("1617196034183-421b4040ed20") },
      { name: "Spicy Tuna Roll",       description: "Fresh tuna with spicy mayo, cucumber and scallions",                price: 300, category: "Sushi",  imageUrl: img("1617196034183-421b4040ed20") },
      { name: "Chicken Teriyaki",      description: "Grilled chicken glazed with teriyaki sauce, steamed rice & salad",  price: 340, category: "Chicken",imageUrl: img("1599487488170-d11ec9c172f0") },
      { name: "Miso Soup",             description: "Savory fermented soybean broth with tofu, wakame and green onion",  price: 100, category: "Soup",   imageUrl: img("1547592166-23ac45744acd") },
      { name: "Edamame",               description: "Lightly salted steamed young soybeans — a perfect starter",         price: 120, category: "Snack",  imageUrl: img("1512621776951-a57141f2eefd") },
      { name: "Chicken Gyoza (5 pcs)", description: "Pan-fried Japanese dumplings with ginger ponzu dipping sauce",      price: 190, category: "Snack",  imageUrl: img("1534422298391-e4f8c172dddb") },
      { name: "Tonkotsu Ramen",        description: "Rich pork-bone broth with chashu, soft egg and bamboo shoots",      price: 360, category: "Noodles",imageUrl: img("1569718212165-3a8278d5f624") },
      { name: "Matcha Ice Cream",      description: "Two scoops of premium Japanese green tea ice cream",                price: 150, category: "Dessert",imageUrl: img("1551024506-0bccd828d307") },
    ],
  },
  // 7 ─────────────────────────────────────────────────────────────────────────
  {
    name: "Taco Fiesta",
    location: "Indiranagar, Bangalore",
    category: ["veg", "non-veg"],
    variety: ["mexican"],
    offer: "Taco Tuesday — 3 tacos for ₹250",
    image: rImg("1565299585323-38d6b0865b47"),
    rating: 4.3,
    products: [
      { name: "Chicken Tacos (2 pcs)", description: "Grilled spiced chicken in corn tortillas with pico de gallo",       price: 200, category: "Tacos",   imageUrl: img("1565299585323-38d6b0865b47") },
      { name: "Beef Burrito",          description: "Big flour tortilla stuffed with rice, beans, beef and sour cream",  price: 280, category: "Burrito", imageUrl: img("1599487488170-d11ec9c172f0") },
      { name: "Loaded Nachos",         description: "Crispy tortilla chips with cheese, jalapeños, beans and guacamole", price: 220, category: "Snack",   imageUrl: img("1573080496219-bb964701c2b8") },
      { name: "Cheese Quesadilla",     description: "Grilled flour tortilla filled with melted cheese and peppers",      price: 180, category: "Snack",   imageUrl: img("1476718406336-4b801b173a7e") },
      { name: "Guacamole & Chips",     description: "Freshly smashed avocado with lime, cilantro and tortilla chips",   price: 160, category: "Snack",   imageUrl: img("1512621776951-a57141f2eefd") },
      { name: "Enchilada (2 pcs)",     description: "Rolled tortillas in red chile sauce with chicken and melted cheese",price: 240, category: "Chicken", imageUrl: img("1603894584373-5ac82b2ae398") },
      { name: "Churros with Chocolate","description": "Crispy cinnamon-dusted fried dough sticks with warm chocolate dip",price: 150, category: "Dessert", imageUrl: img("1578985545062-69928b1d9587") },
      { name: "Prawn Tacos (2 pcs)",   description: "Garlic-lime prawns in soft tortilla with mango salsa",             price: 260, category: "Seafood", imageUrl: img("1519708227418-1e0f1d7a0d93") },
      { name: "Mexican Rice Bowl",     description: "Spiced tomato rice with black beans, corn and pico de gallo",      price: 190, category: "Rice",     imageUrl: img("1603133872878-684f208fb84b") },
      { name: "Horchata",              description: "Chilled sweet cinnamon rice milk drink served over ice",            price: 110, category: "Drink",    imageUrl: img("1553361371-9b09328b3c15") },
    ],
  },
  // 8 ─────────────────────────────────────────────────────────────────────────
  {
    name: "The Grill House",
    location: "Karol Bagh, Delhi",
    category: ["non-veg"],
    variety: ["bbq"],
    offer: "Mixed grill platter for 2 at ₹799",
    image: rImg("1544025162-d76538733a0c"),
    rating: 4.5,
    products: [
      { name: "BBQ Half Chicken",      description: "Slow-smoked half chicken basted with house BBQ sauce",             price: 380, category: "Chicken", imageUrl: img("1599487488170-d11ec9c172f0") },
      { name: "Grilled King Prawns",   description: "Jumbo prawns marinated in herb oil and grilled on charcoal",       price: 420, category: "Seafood", imageUrl: img("1519708227418-1e0f1d7a0d93") },
      { name: "Mutton Seekh Kebab",    description: "Spiced minced mutton skewers grilled in a clay oven",              price: 340, category: "Mutton",  imageUrl: img("1599487488170-d11ec9c172f0") },
      { name: "Beef Steak",            description: "250g striploin grilled to perfection, served with fries and sauce",price: 580, category: "Beef",    imageUrl: img("1544025162-d76538733a0c") },
      { name: "Grilled Corn",          description: "Sweet corn on the cob grilled with butter and chili-lime spice",   price: 80,  category: "Veg",     imageUrl: img("1512621776951-a57141f2eefd") },
      { name: "Baby Back Ribs",        description: "Slow-roasted pork ribs glazed with sticky bourbon BBQ sauce",      price: 620, category: "Pork",    imageUrl: img("1544025162-d76538733a0c") },
      { name: "Lamb Chops (3 pcs)",    description: "French-cut lamb chops marinated with rosemary and garlic",        price: 480, category: "Mutton",  imageUrl: img("1599487488170-d11ec9c172f0") },
      { name: "Grilled Salmon Fillet", description: "Atlantic salmon grilled with lemon butter, served with asparagus", price: 520, category: "Seafood", imageUrl: img("1519708227418-1e0f1d7a0d93") },
      { name: "Mixed Grill Platter",   description: "Chicken, prawn, seekh kebab and steak with grilled veggies",      price: 780, category: "Chicken", imageUrl: img("1544025162-d76538733a0c") },
      { name: "BBQ Pulled Pork Sandwich","description":"Slow-cooked pulled pork piled on a toasted bun with slaw",     price: 280, category: "Pork",    imageUrl: img("1568901346375-23c9450c58cd") },
    ],
  },
  // 9 ─────────────────────────────────────────────────────────────────────────
  {
    name: "Sweet Dreams",
    location: "Powai, Mumbai",
    category: ["veg"],
    variety: ["desserts"],
    offer: "Any 3 desserts for ₹350",
    image: rImg("1578985545062-69928b1d9587"),
    rating: 4.8,
    products: [
      { name: "Chocolate Lava Cake",  description: "Warm dark chocolate cake with a molten fudge center",              price: 180, category: "Dessert", imageUrl: img("1578985545062-69928b1d9587") },
      { name: "New York Cheesecake",  description: "Creamy baked cheesecake on a buttery graham cracker crust",        price: 200, category: "Dessert", imageUrl: img("1565958011703-44f9829ba187") },
      { name: "Waffle Stack",         description: "Crispy Belgian waffles stacked with fresh berries and maple syrup", price: 220, category: "Dessert", imageUrl: img("1563805942-f09bbff099d6") },
      { name: "Vanilla Ice Cream",    description: "3 scoops of hand-churned Madagascar vanilla bean ice cream",       price: 140, category: "Ice Cream",imageUrl: img("1551024506-0bccd828d307") },
      { name: "Tiramisu",             description: "Espresso-soaked ladyfingers with mascarpone and cocoa powder",     price: 190, category: "Dessert", imageUrl: img("1571877227200-a0d98ea607e9") },
      { name: "Chocolate Brownie",    description: "Fudgy walnut brownie served warm with vanilla ice cream scoop",    price: 160, category: "Dessert", imageUrl: img("1578985545062-69928b1d9587") },
      { name: "Fruit Tart",           description: "Buttery pastry shell with custard cream and seasonal fresh fruits", price: 170, category: "Dessert", imageUrl: img("1571877227200-a0d98ea607e9") },
      { name: "Cinnamon Roll",        description: "Soft spiral bun swirled with cinnamon sugar and cream cheese icing",price: 120, category: "Bakery",  imageUrl: img("1476718406336-4b801b173a7e") },
      { name: "Mango Parfait",        description: "Layers of mango puree, yogurt, granola and fresh mango chunks",    price: 180, category: "Dessert", imageUrl: img("1551024506-0bccd828d307") },
      { name: "Strawberry Milkshake", description: "Thick shake blended with fresh strawberries and premium ice cream",price: 160, category: "Drink",   imageUrl: img("1572490122132-bb8e251b7ec1") },
    ],
  },
  // 10 ─────────────────────────────────────────────────────────────────────────
  {
    name: "Noodle Kingdom",
    location: "Park Street, Kolkata",
    category: ["veg", "non-veg"],
    variety: ["pan-asian"],
    offer: "Free miso soup with noodle orders",
    image: rImg("1569718212165-3a8278d5f624"),
    rating: 4.3,
    products: [
      { name: "Pad Thai",            description: "Rice noodles stir-fried with egg, bean sprouts and tamarind sauce", price: 250, category: "Noodles", imageUrl: img("1569718212165-3a8278d5f624") },
      { name: "Chicken Pho",         description: "Vietnamese aromatic broth with flat rice noodles and fresh herbs",  price: 280, category: "Soup",    imageUrl: img("1547592166-23ac45744acd") },
      { name: "Korean Ramyun",       description: "Spicy Korean instant ramen upgraded with soft egg and vegetables",  price: 220, category: "Noodles", imageUrl: img("1569718212165-3a8278d5f624") },
      { name: "Tom Yum Noodles",     description: "Thai hot-sour lemongrass soup with rice noodles and prawns",       price: 290, category: "Soup",    imageUrl: img("1547592166-23ac45744acd") },
      { name: "Udon Noodles",        description: "Thick wheat noodles in a dashi broth with tempura and scallions",  price: 300, category: "Noodles", imageUrl: img("1569718212165-3a8278d5f624") },
      { name: "Glass Noodle Salad",  description: "Chilled glass noodles tossed with herbs, lime and chili dressing", price: 180, category: "Salad",   imageUrl: img("1512621776951-a57141f2eefd") },
      { name: "Dan Dan Noodles",     description: "Sichuan noodles in spicy sesame chili oil with minced pork",       price: 260, category: "Noodles", imageUrl: img("1569718212165-3a8278d5f624") },
      { name: "Laksa",               description: "Malaysian coconut milk curry soup with noodles and chicken",        price: 310, category: "Soup",    imageUrl: img("1547592166-23ac45744acd") },
      { name: "Yaki Udon",           description: "Stir-fried thick udon noodles with mixed vegetables and soy",      price: 270, category: "Noodles", imageUrl: img("1569718212165-3a8278d5f624") },
      { name: "Mango Sticky Rice",   description: "Thai dessert — sweet glutinous rice with ripe mango and coconut milk", price: 160, category: "Dessert",imageUrl: img("1551024506-0bccd828d307") },
    ],
  },
  // 11 ─────────────────────────────────────────────────────────────────────────
  {
    name: "Green Garden",
    location: "Whitefield, Bangalore",
    category: ["veg"],
    variety: ["vegan"],
    offer: "10% off for first-time orders",
    image: rImg("1512621776951-a57141f2eefd"),
    rating: 4.4,
    products: [
      { name: "Caesar Salad",        description: "Crisp romaine lettuce, croutons and parmesan with Caesar dressing",  price: 180, category: "Salad",   imageUrl: img("1512621776951-a57141f2eefd") },
      { name: "Greek Salad",         description: "Cucumber, tomato, olive, feta and red onion with oregano dressing",  price: 200, category: "Salad",   imageUrl: img("1512621776951-a57141f2eefd") },
      { name: "Quinoa Power Bowl",   description: "Quinoa with roasted veggies, chickpeas, avocado and tahini sauce",   price: 280, category: "Bowl",    imageUrl: img("1512621776951-a57141f2eefd") },
      { name: "Avocado Toast",       description: "Sourdough toast with smashed avocado, cherry tomato and everything spice", price: 200, category: "Snack", imageUrl: img("1476718406336-4b801b173a7e") },
      { name: "Açaí Berry Bowl",     description: "Blended açaí topped with granola, banana, berries and honey drizzle",price: 260, category: "Bowl",    imageUrl: img("1551024506-0bccd828d307") },
      { name: "Falafel Wrap",        description: "Crispy chickpea falafel in flatbread with tzatziki and veggies",     price: 220, category: "Wrap",    imageUrl: img("1601050690597-df0568f70950") },
      { name: "Smoothie Bowl",       description: "Thick blended mango-banana base with tropical fruit toppings",      price: 240, category: "Drink",   imageUrl: img("1553361371-9b09328b3c15") },
      { name: "Hummus Platter",      description: "Creamy hummus with pita, olives, carrots and cucumber sticks",      price: 180, category: "Snack",   imageUrl: img("1512621776951-a57141f2eefd") },
      { name: "Vegan Tacos (2 pcs)", description: "Black bean, corn and guacamole in soft corn tortillas",             price: 190, category: "Tacos",   imageUrl: img("1565299585323-38d6b0865b47") },
      { name: "Lemon Detox Water",   description: "Chilled infused water with cucumber, mint and lemon slices",        price: 80,  category: "Drink",   imageUrl: img("1553361371-9b09328b3c15") },
    ],
  },
  // 12 ─────────────────────────────────────────────────────────────────────────
  {
    name: "Sea Pearl",
    location: "Marine Drive, Mumbai",
    category: ["non-veg"],
    variety: ["seafood"],
    offer: "Catch of the day special — ask staff",
    image: rImg("1519708227418-1e0f1d7a0d93"),
    rating: 4.6,
    products: [
      { name: "Grilled Fish",          description: "Whole pomfret marinated with coastal spices and grilled on charcoal",price: 420, category: "Seafood", imageUrl: img("1519708227418-1e0f1d7a0d93") },
      { name: "Fish & Chips",          description: "Beer-battered fish fillet with thick-cut fries and tartar sauce",   price: 320, category: "Seafood", imageUrl: img("1519708227418-1e0f1d7a0d93") },
      { name: "Prawn Masala",          description: "Tiger prawns cooked in tangy Goan coconut tomato masala",          price: 480, category: "Seafood", imageUrl: img("1519708227418-1e0f1d7a0d93") },
      { name: "Lobster Bisque",        description: "Velvety cream soup enriched with whole roasted lobster stock",      price: 550, category: "Soup",    imageUrl: img("1547592166-23ac45744acd") },
      { name: "Calamari Rings",        description: "Golden-fried squid rings with lemon aioli and sweet chili sauce",  price: 280, category: "Seafood", imageUrl: img("1519708227418-1e0f1d7a0d93") },
      { name: "Crab Cakes (2 pcs)",    description: "Pan-seared blue crab cakes with remoulade and microgreens",        price: 360, category: "Seafood", imageUrl: img("1519708227418-1e0f1d7a0d93") },
      { name: "Prawn Fried Rice",      description: "Wok-tossed basmati rice with juicy prawns, egg and vegetables",   price: 320, category: "Rice",    imageUrl: img("1603133872878-684f208fb84b") },
      { name: "Tuna Steak",            description: "Seared yellowfin tuna steak with sesame crust and wasabi mayo",    price: 520, category: "Seafood", imageUrl: img("1519708227418-1e0f1d7a0d93") },
      { name: "Clam Chowder",          description: "Creamy New England style soup with clams, potato and bacon",       price: 280, category: "Soup",    imageUrl: img("1547592166-23ac45744acd") },
      { name: "Fish Tikka (4 pcs)",    description: "Tandoor-grilled spiced fish chunks served with mint chutney",      price: 340, category: "Seafood", imageUrl: img("1519708227418-1e0f1d7a0d93") },
    ],
  },
  // 13 ─────────────────────────────────────────────────────────────────────────
  {
    name: "Café Mocha",
    location: "Koregaon Park, Pune",
    category: ["veg"],
    variety: ["cafe"],
    offer: "Buy any coffee, get a muffin at 50% off",
    image: rImg("1510591426687-2c8359c6ac2a"),
    rating: 4.5,
    products: [
      { name: "Cappuccino",          description: "Espresso with steamed milk and a thick layer of velvety micro-foam", price: 160, category: "Coffee",  imageUrl: img("1510591426687-2c8359c6ac2a") },
      { name: "Cold Brew",           description: "12-hour cold-steeped coffee served over ice — smooth and rich",     price: 180, category: "Coffee",  imageUrl: img("1510591426687-2c8359c6ac2a") },
      { name: "Caramel Latte",       description: "Double espresso with steamed milk and house caramel sauce",         price: 190, category: "Coffee",  imageUrl: img("1510591426687-2c8359c6ac2a") },
      { name: "Croissant",           description: "Flaky buttery French croissant, baked fresh every morning",         price: 110, category: "Bakery",  imageUrl: img("1476718406336-4b801b173a7e") },
      { name: "Blueberry Muffin",    description: "Moist muffin bursting with fresh blueberries and streusel topping", price: 100, category: "Bakery",  imageUrl: img("1578985545062-69928b1d9587") },
      { name: "Club Sandwich",       description: "Triple-decker with chicken, bacon, egg, lettuce and tomato",        price: 220, category: "Sandwich",imageUrl: img("1528735602780-2552fd46c7bc") },
      { name: "Cheese Toast",        description: "Thick sourdough toast loaded with melted four-cheese blend",        price: 130, category: "Sandwich",imageUrl: img("1476718406336-4b801b173a7e") },
      { name: "Chocolate Cake Slice","description":"Dark chocolate sponge with ganache frosting and chocolate shavings", price: 160, category: "Dessert", imageUrl: img("1578985545062-69928b1d9587") },
      { name: "Peach Iced Tea",      description: "Refreshing brewed black tea with peach syrup and fresh mint",       price: 130, category: "Drink",   imageUrl: img("1553361371-9b09328b3c15") },
      { name: "Granola Parfait",     description: "Layers of Greek yogurt, house granola and mixed berry compote",     price: 180, category: "Dessert", imageUrl: img("1551024506-0bccd828d307") },
    ],
  },
  // 14 ─────────────────────────────────────────────────────────────────────────
  {
    name: "Street Bites",
    location: "Chandni Chowk, Delhi",
    category: ["veg", "non-veg"],
    variety: ["street-food"],
    offer: "Chaat combo for ₹99",
    image: rImg("1601050690597-df0568f70950"),
    rating: 4.2,
    products: [
      { name: "Pav Bhaji",          description: "Buttery spiced vegetable mash served with toasted butter pav rolls",  price: 120, category: "Snack",   imageUrl: img("1626132527686-4cfc148c1a13") },
      { name: "Vada Pav",           description: "Mumbai's famous spiced potato fritter in a soft pav with chutneys",  price: 40,  category: "Snack",   imageUrl: img("1601050690597-df0568f70950") },
      { name: "Pani Puri (6 pcs)",  description: "Hollow crispy puris filled with spiced water, potato and tamarind", price: 60,  category: "Snack",   imageUrl: img("1601050690597-df0568f70950") },
      { name: "Bhel Puri",          description: "Puffed rice with veggies, sev, raw mango and tangy chutneys",       price: 70,  category: "Snack",   imageUrl: img("1601050690597-df0568f70950") },
      { name: "Aloo Tikki Chaat",   description: "Crispy potato patties topped with yogurt, chutneys and pomegranate", price: 90,  category: "Snack",   imageUrl: img("1601050690597-df0568f70950") },
      { name: "Egg Kathi Roll",     description: "Egg-coated roti wrapped with spiced chicken, onion and chutney",    price: 100, category: "Chicken", imageUrl: img("1599487488170-d11ec9c172f0") },
      { name: "Dahi Puri (6 pcs)",  description: "Puris topped with potato, chickpeas, yogurt and two chutneys",     price: 80,  category: "Snack",   imageUrl: img("1601050690597-df0568f70950") },
      { name: "Corn Bhutta",        description: "Roasted sweet corn on cob with lime, butter and masala seasoning",  price: 60,  category: "Snack",   imageUrl: img("1512621776951-a57141f2eefd") },
      { name: "Masala Chai",        description: "Aromatic spiced milk tea brewed with ginger, cardamom and cloves",  price: 30,  category: "Drink",   imageUrl: img("1510591426687-2c8359c6ac2a") },
      { name: "Raj Kachori",        description: "Giant crispy shell with potato, sprouts, yogurt and sweet chutney", price: 110, category: "Snack",   imageUrl: img("1601050690597-df0568f70950") },
    ],
  },
  // 15 ─────────────────────────────────────────────────────────────────────────
  {
    name: "Royal Feast",
    location: "Salt Lake, Kolkata",
    category: ["veg", "non-veg"],
    variety: ["multi-cuisine"],
    offer: "Complimentary dessert on orders above ₹700",
    image: rImg("1585937421612-70a008356fbe"),
    rating: 4.5,
    products: [
      { name: "Chicken Tikka Kebab",  description: "Boneless chicken marinated in tandoori spices and grilled",        price: 300, category: "Chicken", imageUrl: img("1599487488170-d11ec9c172f0") },
      { name: "Lamb Dum Biryani",     description: "Slow-cooked lamb biryani sealed in dough and finished in oven",    price: 420, category: "Biryani", imageUrl: img("1563379091339-03b21ab4a4f8") },
      { name: "Pasta Alfredo",        description: "Fettuccine in classic butter and parmesan cream sauce",            price: 260, category: "Pasta",   imageUrl: img("1621996346565-e3dbc646d9a9") },
      { name: "Mushroom Risotto",     description: "Creamy Arborio rice with porcini mushrooms and truffle oil",       price: 310, category: "Rice",    imageUrl: img("1603133872878-684f208fb84b") },
      { name: "Fish Tikka (4 pcs)",   description: "Spiced fish fillets marinated in carom yogurt, pan-grilled",       price: 340, category: "Seafood", imageUrl: img("1519708227418-1e0f1d7a0d93") },
      { name: "Prawn Masala",         description: "Jumbo prawns in spiced tomato coconut gravy, served with rice",   price: 460, category: "Seafood", imageUrl: img("1519708227418-1e0f1d7a0d93") },
      { name: "Veg Spring Rolls",     description: "Crispy rolls stuffed with glass noodles and stir-fried vegetables",price: 160, category: "Snack",   imageUrl: img("1563245372-f21724e3856d") },
      { name: "BBQ Chicken Pizza",    description: "Thick-crust pizza with BBQ chicken, peppers and red onion",       price: 340, category: "Pizza",   imageUrl: img("1574071318508-1cdbab80d002") },
      { name: "Chocolate Mousse",     description: "Airy dark chocolate mousse served in a chilled glass",            price: 180, category: "Dessert", imageUrl: img("1578985545062-69928b1d9587") },
      { name: "Mixed Grill Platter",  description: "Assorted chicken tikka, seekh, fish tikka and prawns on one plate",price: 650, category: "Chicken", imageUrl: img("1544025162-d76538733a0c") },
    ],
  },
];

// ─── Seed function ────────────────────────────────────────────────────────────
async function seed() {
  try {
    await connect(process.env.DB_URL);
    console.log("✅ Connected to DB");

    // 1. Create or find vendor user
    let vendor = await User.findOne({ email: "vendor@seedfood.com" });
    if (!vendor) {
      vendor = await User.create({
        name: "Seed Vendor",
        email: "vendor@seedfood.com",
        phone: "9000000000",
        password: await bcrypt.hash("vendor123", 10),
        role: "vendor",
      });
      console.log("✅ Vendor user created (email: vendor@seedfood.com  pass: vendor123)");
    } else {
      console.log("ℹ️  Using existing vendor:", vendor.email);
    }

    // ── Wipe existing data for a clean re-seed ──────────────────────────────
    await Product.deleteMany({});
    await Restaurant.deleteMany({});
    console.log("🗑️  Cleared existing restaurants and products");

    let createdRestaurants = 0;
    let createdProducts = 0;
    let skippedRestaurants = 0;

    for (const r of RESTAURANTS) {
      // Create restaurant
      const restaurant = await Restaurant.create({
        name: r.name,
        location: r.location,
        category: r.category,
        variety: r.variety,
        offer: r.offer,
        image: r.image,
        rating: r.rating,
        owner: vendor._id,
      });
      createdRestaurants++;

      // Create 10 products for this restaurant
      const productDocs = r.products.map((p) => ({
        ...p,
        restaurant: restaurant._id,
      }));
      await Product.insertMany(productDocs);
      createdProducts += productDocs.length;
      console.log(`✅ ${r.name}  (${productDocs.length} products)`);
    }

    console.log("\n🎉 Seed complete!");
    console.log(`   Restaurants created : ${createdRestaurants}`);
    console.log(`   Restaurants skipped : ${skippedRestaurants}`);
    console.log(`   Products created    : ${createdProducts}`);
    await disconnect();
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
