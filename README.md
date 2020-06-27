# Web shop and community market for second hand clothing

This was our final project at the Technigo coding bootcamp. We worked in a team of three people and together we built a mock web shop where you can shop used clothing and also sign up and sell your own used clothing online!

## Approach

We started out by making an extensive plan for our project. We went through the flow of the web shop we planned to build, thinking about where we wanted the user to go next on our site and how to make it easy for them to get there. 

Next we decided which endpoints and which Mongoose models we needed in the backend. Our main models are for user, order and product. The product model was from the beginning adapted to allow for both upload of products from us and from the users. Part of the product pictures are uploaded by us directly to Cloudinary and stored there. Part of the pictures are uploaded by users through the site to Cloudinary. 

Apart from the backend structure we also decided what routes and pages we wanted and how we wanted to use Redux. We use Redux to keep the state associated with the user, such as login, signup, profile page, order history and uploaded products. We also use Redux to keep the state associated with the cart, such as add and remove item, clear cart and submit order. 

We started with the design quite late in the project, we already had all the pages in place and the majority of the functionality of the site. We found a couple of great design sketches online and decided to follow one of them when it comes to colors, fonts and buttons, and to add a couple of cool features from another one, such as the background picture on the login- and signup-pages. 

## Learning objectives

The aim of the final project was to build a bigger project that combined all the technologies we had previously used during the bootcamp. 

## Technologies

- Node.js
- Express
- Mongo DB
- Mongoose
- API
- React
- Redux
- JSX
- Javascript ES6
- Styled Components

## View it live

Backend: https://final-technigo-project.herokuapp.com/

Frontend: https://hippo-clothing.netlify.app/

Frontend repository: https://github.com/annatakman/Final-Project-Frontend

// Kajsa, Frida and Anna