const { createServer } = require("node:http");
const fs = require("fs");
const queryString = require("querystring");
const PORT = 8080;

// Request Handler
const requestHandler = (req, res) => {
  const { method, url } = req;
  if (method === "GET" && url === "/") {
    fs.readFile("index.html", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error.");
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      }
    });
  } else if (method === "POST" && url === "/") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const formData = queryString.parse(body);
      const { firstName, lastName, otherNames, email, phoneNumber, gender } =
        formData;

      const errors = [];

      if (!firstName || !lastName) {
        errors.push("First name and last name are required.");
      }
      if (
        firstName &&
        lastName &&
        (firstName.length < 1 || lastName.length < 1)
      ) {
        errors.push("The name cannot be less than 1 character.");
      }
      if (
        (firstName && /\d/.test(firstName)) ||
        (lastName && /\d/.test(lastName))
      ) {
        errors.push("The name cannot contain numbers.");
      }
      if (!email) {
        errors.push("Email is required");
      } else if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
        errors.push("Please provide a valid email address.");
      }
      if (!phoneNumber) {
        errors.push("Phone number is required.");
      } else if (!/^\d{3}\d{3}\d{4}$/.test(phoneNumber)) {
        errors.push(
          "Please provide a phone number in the format '+XXX XXX XXX XXXX'."
        );
      }

      if (!gender) {
        errors.push("Gender is required.");
      }

      if (errors.length > 0) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ errors }));
      } else {
        const formDataObj = {
          firstName,
          lastName,
          otherNames: otherNames || "",
          email,
          phoneNumber: `+234${phoneNumber}`,
          gender,
        };

        const jsonData = JSON.stringify(formDataObj, null, 2);

        fs.writeFile("database.json", jsonData, (err) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Error saving form data" }));
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ message: "Form data submitted successfully" })
            );
          }
        });
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
};

const server = createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
