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
const individualContributionrouter = require("./routers/individualcontributionroutes");
// const edittransactionrouter = require("./routers/edittransactionroutes");

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.static(__dirname + "/public"));
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
app.use("/admin/accounttotal", individualContributionrouter);

function updateUserAccount2(body) {
  var currentCalculation;
  var query = {};
  var accountValue = {};

  accountModel.findOne({ username: body.user }, (err, doc) => {
    switch (body.account) {
      case "sharecapital":
        accountValue["account"] = doc.sharecapital;
        break;
      case "thriftsavings":
        accountValue["account"] = doc.thriftsavings;
        break;
      case "specialdeposit":
        accountValue["account"] = doc.specialdeposit;
        break;
      case "commoditytrading":
        accountValue["account"] = doc.commoditytrading;
        break;
      case "fine":
        accountValue["account"] = doc.fine;
        break;
      case "loan":
        accountValue["account"] = doc.loan;
        break;
      case "projectfinancing":
        accountValue["account"] = doc.projectfinancing;
        break;
      default:
        break;
    }

    if (body.transactiontype == "credit") {
      currentCalculation =
        parseFloat(accountValue.account) + parseFloat(body.amount);
    } else {
      currentCalculation =
        parseFloat(accountValue.account) - parseFloat(body.amount);
    }

    currentCalculation = (Math.round(currentCalculation * 100) / 100).toFixed(
      2
    );
    query[body.account] = currentCalculation;

    accountModel.updateOne(
      { username: body.user },
      { $set: query },
      (err, doc) => {
        if (err) {
          console.log(err);
        } else {
        }
      }
    );
  });
}

function updateUserAccount(body, previousDetails, doc) {
  var previousCalculation;
  var query = {};
  var accountValue = {};
  // var query = {};
  // query[account] = closingAmount;
  switch (previousDetails.account) {
    case "sharecapital":
      accountValue["account"] = doc.sharecapital;
      break;
    case "thriftsavings":
      accountValue["account"] = doc.thriftsavings;
      break;
    case "specialdeposit":
      accountValue["account"] = doc.specialdeposit;
      break;
    case "commoditytrading":
      accountValue["account"] = doc.commoditytrading;
      break;
    case "fine":
      accountValue["account"] = doc.fine;
      break;
    case "loan":
      accountValue["account"] = doc.loan;
      break;
    case "projectfinancing":
      accountValue["account"] = doc.projectfinancing;
      break;

    default:
      break;
  }

  previousCalculation =
    parseFloat(accountValue.account) - parseFloat(previousDetails.amount);

  previousCalculation = (Math.round(previousCalculation * 100) / 100).toFixed(
    2
  );

  query[previousDetails.account] = previousCalculation;

  accountModel
    .updateOne({ username: body.user }, { $set: query }, (err, doc) => {
      if (err) {
        console.log(err);
      } else {
      }
    })
    .then(() => {
      updateUserAccount2(body);
    });
}

app
  .get("/edittransaction", (req, res) => {
    if (req.isAuthenticated()) {
      if (req.user.username == process.env.ADMIN_USERNAME) {
        trans = req.query.valid;

        var tran = JSON.parse(trans);

        var amountToSend = "";
        try {
          var checkAmount = String(tran.amount).split("-");

          if (checkAmount.length == 1) {
            amountToSend = checkAmount[0];
          } else {
            amountToSend = checkAmount[1];
          }
        } catch (error) {
          console.log(error);
        }

        res.render("edittransaction", {
          id: tran._id,
          transactiontype: tran.transactiontype,
          account: tran.account,
          amount: amountToSend,
          narration: tran.narration,
          date: tran.date,
          user: tran.user,
        });
      } else {
        res.redirect("dashboard");
      }
    } else {
      res.redirect("/");
    }
  })
  .post("/edittransaction", (req, res) => {
    // console.log(req.body);

    if (req.body.actiontoperform == "update") {
      accountModel.findOne({ username: req.body.user }, (err, doc) => {
        if (err) {
          console.log(err);
        } else {
          for (const key in doc.transactions) {
            if (doc.transactions[key]._id == req.body.id) {
              var previousDetails = {
                id: doc.transactions[key]._id,
                transactiontype: doc.transactions[key].transactiontype,
                account: doc.transactions[key].account,
                amount: doc.transactions[key].amount,
                narration: doc.transactions[key].narration,
                date: doc.transactions[key].date,
              };
              updateUserAccount(req.body, previousDetails, doc);
              // accountModel.updateOne({username: req.body.user}, {$set:previousDetails.account:})
              // var finalKey = key;
              if (req.body.transactiontype == "credit") {
                accountModel.findOneAndUpdate(
                  { username: req.body.user },
                  {
                    $set: {
                      "transactions.$[key].transactiontype":
                        req.body.transactiontype,
                      "transactions.$[key].account": req.body.account,
                      "transactions.$[key].amount": parseFloat(req.body.amount),
                      "transactions.$[key].narration": req.body.narration,
                      "transactions.$[key].date": req.body.date,
                    },
                  },
                  {
                    arrayFilters: [{ "key._id": req.body.id }],
                    new: true,
                  },
                  (err, doc) => {
                    if (err) {
                      console.log(err);
                    } else {
                      var tran = {
                        _id: req.body.id,
                        transactiontype: req.body.transactiontype,
                        account: req.body.account,
                        amount: parseFloat(req.body.amount),
                        narration: req.body.narration,
                        date: req.body.date,
                        user: req.body.user,
                      };
                      var data = JSON.stringify(tran);
                      res.send(data);
                    }
                  }
                );
              } else {
                accountModel.findOneAndUpdate(
                  { username: req.body.user },
                  {
                    $set: {
                      "transactions.$[key].transactiontype":
                        req.body.transactiontype,
                      "transactions.$[key].account": req.body.account,
                      "transactions.$[key].amount": parseFloat(
                        -+req.body.amount
                      ),
                      "transactions.$[key].narration": req.body.narration,
                      "transactions.$[key].date": req.body.date,
                    },
                  },
                  {
                    arrayFilters: [{ "key._id": req.body.id }],
                    new: true,
                  },
                  (err, doc) => {
                    if (err) {
                      console.log(err);
                    } else {
                      var tran = {
                        _id: req.body.id,
                        transactiontype: req.body.transactiontype,
                        account: req.body.account,
                        amount: parseFloat(-+req.body.amount),
                        narration: req.body.narration,
                        date: req.body.date,
                        user: req.body.user,
                      };
                      var data = JSON.stringify(tran);
                      res.send(data);
                    }
                  }
                );
              }
            }
          }
        }
      });
    } else if (req.body.actiontoperform == "delete") {
      var finalValue;

      accountModel.findOne({ username: req.body.user }, (err, found) => {
        if (req.body.transactiontype == "debit") {
          finalValue =
            parseFloat(found.sharecapital) + parseFloat(req.body.amount);
        } else {
          finalValue =
            parseFloat(found.sharecapital) - parseFloat(req.body.amount);
        }

        // console.log(finalValue);

        accountModel.findOneAndUpdate(
          { username: req.body.user },
          { sharecapital: finalValue.toFixed(2) },
          function (err, doc) {
            if (err) {
            } else {
              accountModel.findOneAndUpdate(
                { username: req.body.user },
                { $pull: { transactions: { _id: req.body.id } } },
                { safe: true, upsert: true },
                function (err, doc) {
                  if (err) {
                  } else {
                    var data = {
                      ok: 1,
                      user: req.body.user,
                    };
                    res.json(data);
                  }
                }
              );
            }
          }
        );
      });
    } else {
    }
  });
// app.use("/edittransaction",edittransactionrouter)

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
