const express = require("express");
const app = express();
const fs = require("fs");
const csv = require("csv-parser");

const results = [];

fs.createReadStream("data.csv")
  .pipe(csv())
  .on("data", (data) => {
    results.push(data);
  })
  .on("end", () => {console.log("Server Started Successfully"); app.disable();});

// HomePage
app.get('/', (req, res) => {
  res.send('Volopay Assignment');
});

// API 1: Total items sold in Marketing for the last quarter (q3) of the year
app.get("/api/total_items", (req, res) => {
  const startDate= new Date(req.query.start_date);
  const endDate=new Date(req.query.end_date);
  var count = 0;
  for (var i = 0; i < results.length; i++) {
    const date = new Date(results[i].date);
    if (date >= startDate  && date<=  endDate && results[i].department===marketing) {
       
    count++;
        }
    }
  
  res.json({ total_items: count });
});

// API 2: Nth most sold item in terms of quantity sold or total price
app.get("/api/nth_most_total_item", (req, res) => {
  let softwareMap = {};
  for (var i = 0; i < results.length; i++) {
    const date = results[i].date.substring(0, 11).split("-")[1];
    if (Number(date) >= 10 && Number(date) <= 12) {
      softwareMap[results[i].software] =
        (softwareMap[results[i].software] || 0) + 1;
    }
  }
  let Software1 = Object.entries(softwareMap);
  Software1.sort((a, b) => b[1] - a[1]);
  Software1 = Software1[1][0];

  for (var i = 0; i < results.length; i++) {
    const date = results[i].date.substring(0, 11).split("-")[1];
    if (Number(date) >= 4 && Number(date) <= 6) {
      softwareMap[results[i].software] =
        (softwareMap[results[i].software] || 0) + 1;
    }
  }
  let Software2 = Object.entries(softwareMap);
  Software2.sort((a, b) => b[1] - a[1]);
  Software2 = Software2[3][0];
  res.json({ "software1": Software1, "software2": Software2 });
});

// API 3: Percentage of sold items (seats) department-wise
app.get("/api/percentage_of_department_wise_sold_items", (req, res) => {
  let DepartmentMap = {};
  var total_count = 0;
  for (var i = 0; i < results.length; i++) {
    DepartmentMap[results[i].department] =
      Number(DepartmentMap[results[i].department] || results[i].seats) +
      Number([results[i].seats]);
    total_count = total_count + Number(results[i].seats);
  }
  console.log(total_count);
  for (let key in DepartmentMap) {
    DepartmentMap[key] =
      ((Number(DepartmentMap[key]) * 100) / total_count).toFixed(2).toString() +
      "%";
  }
  res.json(DepartmentMap);
});

// API 4: Monthly sales for a specific product
app.get("/api/monthly_sales", (req, res) => {
  let prod_name = results[0].software;
  let MonthlyMap = {};
  let MonthlySalesMap = [];
  const prod_date = results[0].date.substring(0, 11).split("-")[0];
  for (var i = 0; i < results.length; i++) {
    let name = results[i].software;
    let date = results[i].date.substring(0, 11).split("-");
    if (prod_date == date[0]) {
      if (prod_name == name) {
        MonthlyMap[date[1]] =
          (MonthlyMap[date[1]] ||
            Number(results[i].seats) * Number(results[i].amount)) +
          Number(results[i].seats) * Number(results[i].amount);
      }
    }
  }
  for (let key in MonthlyMap) {
    MonthlySalesMap.push(MonthlyMap[key]);
  }
  res.json({ software: prod_name, product_year: prod_date, sales: MonthlySalesMap });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});