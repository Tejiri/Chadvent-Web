require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const userModel = require("./models/usermodel");
const accountModel = require("./models/accountmodels");
const memberModel = require("./models/membermodels");
const newsModel = require("./models/newsmodel");
const homerouter = require("./routers/homeroutes");
const dashboardrouter = require("./routers/dashboardroutes");
const logoutrouter = require("./routers/logoutroutes");
const adminrouter = require("./routers/adminroutes");
const jsonrouter = require("./routers/jsonroutes");
const editmemberrouter = require("./routers/editmemberroutes");
const addmemberrouter = require("./routers/addmemberroutes");
const newssectionrouter = require("./routers/newssectionroutes");
const statementsrouter = require("./routers/statementsroutes");
const profilerouter = require("./routers/profileroutes");

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.listen(process.env.PORT || 3000);

app.use(bodyParser.urlencoded({ extended: true }));

mongoAtlasUsername = process.env.ATLAS_USERNAME;
mongoAtlasPassword = process.env.ATLAS_PASSWORD;

mongoose.connect(
  "mongodb+srv://" +
    mongoAtlasUsername +
    ":" +
    mongoAtlasPassword +
    "@cluster0.f9vzp.mongodb.net/chadvent",
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  }
);

app.use("/", homerouter);
app.use("/logout", logoutrouter);
app.use("/dashboard", dashboardrouter);
app.use("/admin", adminrouter);
app.use("/json", jsonrouter);
app.use("/editmember", editmemberrouter);
app.use("/addmember", addmemberrouter);
app.use("/newssection", newssectionrouter);
app.use("/statements", statementsrouter);
app.use("/profile", profilerouter);

// contributionList = ["fdsdfds", "dffdsfsd"];
// transaction = {};
// contributionBalance = [];
// fineBalance = [];
// loanBalance = [];
// CommodityTradingBalance = [];
// projectFinancingBalance = [];

// app
//   .route("/profile")
//   .get(function (req, res) {
//     // userModel.findOne({username:req.user.username},function (error,document) {
//     //   document.setPassword("12345", function(err) {
//     //     document.save(function(err){

//     //     });
//     //   console.log(document);
//     // })})
//     if (req.isAuthenticated()) {
//       if (req.user.username == process.env.ADMIN_USERNAME) {
//         res.redirect("admin");
//       } else {
//         memberModel.findOne(
//           { username: req.user.username },
//           function (err, doc) {
//             username = doc.username;
//             title = doc.title;
//             firstname = doc.firstname;
//             lastname = doc.lastname;
//             middlename = doc.middlename;
//             position = doc.position;
//             membershipstatus = doc.membershipstatus;
//             loanapplicationstatus = doc.loanapplicationstatus;
//             phonenumber = doc.phonenumber;
//             email = doc.email;
//             address = doc.address;
//             gender = doc.gender;
//             occupation = doc.occupation;
//             nextofkin = doc.nextofkin;
//             nextofkinaddress = doc.nextofkinaddress;
//             bank = doc.bank;
//             accountnumber = doc.accountnumber;

//             accountModel.findOne(
//               { username: req.user.username },
//               function (err, docs) {
//                 if (err) {
//                 } else {
//                   lastTransactionToProfile = "";
//                   if (docs.transactions.length == 0) {
//                   } else {
//                     lasttransaction =
//                       docs.transactions[docs.transactions.length - 1];

//                     lastTransactionToProfile =
//                       lasttransaction.transactiontype +
//                       " of ₦" +
//                       lasttransaction.amount +
//                       " on " +
//                       lasttransaction.account +
//                       " account ";
//                   }

//                   var totalcontribution =
//                     parseFloat(docs.sharecapital) +
//                     parseFloat(docs.thriftsavings) +
//                     parseFloat(docs.specialdeposit);
//                   totalcontribution = totalcontribution.toFixed(2);
//                   var num_parts = totalcontribution.toString().split(".");
//                   num_parts[0] = num_parts[0].replace(
//                     /\B(?=(\d{3})+(?!\d))/g,
//                     ","
//                   );
//                   finalTotalContribution = num_parts.join(".");

//                   sharecapital = addCommas(docs.sharecapital);
//                   thriftsavings = addCommas(docs.thriftsavings);
//                   specialdeposit = addCommas(docs.specialdeposit);
//                   commoditytrading = addCommas(docs.commoditytrading);
//                   fine = addCommas(docs.fine);
//                   loan = addCommas(docs.loan);
//                   projectfinancing = addCommas(docs.projectfinancing);
//                   transactions = docs.transactions;
//                   contributions = [];
//                   contributionsFinal = [];
//                   contributionBalance = [];
//                   for (const key in transactions) {
//                     if (
//                       transactions[key].account == "sharecapital" ||
//                       transactions[key].account == "thriftsavings" ||
//                       transactions[key].account == "specialdeposit"
//                     ) {
//                       contributions.push(transactions[key]);
//                       if (contributionBalance.length < 1) {
//                         contributionBalance.push(
//                           addCommas(transactions[key].amount)
//                         );
//                       } else {
//                         currentIndex = contributionBalance.length - 1;
//                         currentBalance =
//                           parseFloat(contributionBalance[currentIndex]) +
//                           parseFloat(transactions[key].amount);

//                         currentBalanceToFixed = currentBalance.toFixed(2);

//                         contributionBalance.push(currentBalanceToFixed);
//                       }
//                     } else {
//                     }
//                   }

//                   for (const key in contributionBalance) {
//                     number = addCommas(contributionBalance[key]);
//                     contributionsFinal.push(number);
//                   }
//                   numberOfMembers = 0;
//                   userModel.find(function (findError, findDocs) {
//                     numberOfMembers = findDocs.length - 1;
//                   });

//                   newsModel.find(function (err, news) {
//                     res.render("profile", {
//                       loggedInUser: title + " " + firstname + " " + lastname,
//                       firstname: firstname,
//                       lastname: lastname,
//                       middlename: middlename,
//                       phonenumber: phonenumber,
//                       email: email,
//                       address: address,
//                       gender: gender,
//                       position: position,
//                       membershipcount: numberOfMembers,
//                       membershipstatus: membershipstatus,
//                       lasttransaction: lastTransactionToProfile,
//                       loanapplicationstatus: loanapplicationstatus,
//                       occupation: occupation,
//                       nextofkin: nextofkin,
//                       nextofkinaddress: nextofkinaddress,
//                       bank: bank,
//                       accountnumber: accountnumber,
//                       sharecapital: sharecapital,
//                       thriftsavings: thriftsavings,
//                       specialdeposit: specialdeposit,
//                       totalcontribution: finalTotalContribution,
//                       commoditytrading: commoditytrading,
//                       fine: fine,
//                       loan: loan,
//                       projectfinancing: projectfinancing,
//                       newsList: news,
//                       transactionsList: contributions,
//                       contributionBalance: contributionsFinal,
//                     });
//                   });
//                 }
//               }
//             );
//           }
//         );
//       }
//     } else {
//       res.redirect("/");
//     }
//   })
//   .post(function (req, res) {
//     if (req.body.adminusernametoreset == undefined) {
//       userModel.findOne(
//         { username: req.user.username },
//         function (err, document) {
//           document.setPassword(req.body.newpassword, function (err2) {
//             document.save(function (err3) {
//               res.send("success");
//             });
//           });
//         }
//       );
//     } else {
//       userModel.findOne(
//         { username: req.body.adminusernametoreset },
//         function (err, document) {
//           document.setPassword(req.body.adminusernametoreset, function (err2) {
//             document.save(function (err3) {
//               res.send("success");
//             });
//           });
//         }
//       );
//     }
//   });
