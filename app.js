require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

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

const userShema = new mongoose.Schema({
  username: String,
  password: String,
});

const memberSchema = new mongoose.Schema({
  username: String,
  title: String,
  firstname: String,
  lastname: String,
  middlename: String,
  position: String,
  membershipstatus: String,
  loanapplicationstatus: String,
  phonenumber: String,
  email: String,
  address: String,
  gender: String,
  occupation: String,
  nextofkin: String,
  nextofkinaddress: String,
});

const accountSchema = new mongoose.Schema({
  username: String,
  sharecapital: String,
  thriftsavings: String,
  specialdeposit: String,
  commoditytrading: String,
  fine: String,
  loan: String,
  projectfinancing: String,
  transactions: [
    {
      transactiontype: String,
      account: String,
      amount: String,
      narration: String,
      date: String,
    },
  ],
});

const newsSchema = new mongoose.Schema({
  id: Number,
  title: String,
  content: String,
  date: String,
});

userShema.plugin(passportLocalMongoose);

const userModel = mongoose.model("users", userShema);
const memberModel = mongoose.model("members", memberSchema);
const accountModel = mongoose.model("accounts", accountSchema);
const newsModel = mongoose.model("news", newsSchema);

passport.use(userModel.createStrategy());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

var memberList = [];
contributionList = ["fdsdfds", "dffdsfsd"];
transaction = {};
contributionBalance = [];
fineBalance = [];
loanBalance = [];
CommodityTradingBalance = [];
projectFinancingBalance = [];

function updateAccount(
  accountUsername,
  accountSharecapital,
  accountThriftSavings,
  accountSpecialDeposit,
  accountCommodityTrading,
  accountFine,
  accountLoan,
  accountProjectFinancing,
  transaction,
  res
) {
  try {
    accountModel.updateOne(
      { username: accountUsername },
      {
        $set: {
          username: accountUsername,
          sharecapital: accountSharecapital,
          thriftsavings: accountThriftSavings,
          specialdeposit: accountSpecialDeposit,
          commoditytrading: accountCommodityTrading,
          fine: accountFine,
          loan: accountLoan,
          projectfinancing: accountProjectFinancing,
        },
      },
      function (err, doc) {
        if (err) {
        } else {
        }
      }
    );

    accountModel.updateOne(
      { username: accountUsername },
      {
        $push: { transactions: transaction },
      },
      function (err, doc) {
        if (err) {
          res.send(err);
        } else {
          res.send(doc);
        }
      }
    );
  } catch (error) {}
}

function creditDebitAccount(
  ttaType,
  ttaAccount,
  ttaAmount,
  ttaDescription,
  ttaDate,
  username,
  totalShareCapital,
  totalThriftSavings,
  totalSpecialDeposit,
  totalCommodityTrading,
  totalFine,
  totalLoan,
  totalProjectFinancing,
  res
) {
  transaction = {
    transactiontype: ttaType,
    account: ttaAccount,
    amount: ttaAmount,
    narration: ttaDescription,
    date: ttaDate,
  };

  updateAccount(
    username,
    totalShareCapital,
    totalThriftSavings,
    totalSpecialDeposit,
    totalCommodityTrading,
    totalFine,
    totalLoan,
    totalProjectFinancing,
    transaction,
    res
  );
}

function addCommas(numberToConvert) {
  var num_parts = numberToConvert.toString().split(".");
  num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return num_parts.join(".");
}

function createStatements(date, narration, transactiontype, amount) {
  balance = parseFloat(amount);
  balanceToFixed = balance.toFixed(2);
  finalBalance = addCommas(balanceToFixed);
  accountStatement = {
    date: date,
    narration: narration,
    transactiontype: transactiontype,
    amount: addCommas(amount),
    balance: finalBalance,
  };
  return accountStatement;
}

function addToStatement(
  currentBalance,
  amount,
  date,
  narration,
  transactiontype
) {
  finalBalance =
    parseFloat(currentBalance.replace(/,/g, "")) + parseFloat(amount);

  finalBalanceToFixed = finalBalance.toFixed(2);

  finalBalanceCommas = addCommas(finalBalanceToFixed);

  accountStatement = {
    date: date,
    narration: narration,
    transactiontype: transactiontype,
    amount: addCommas(amount),
    balance: finalBalanceCommas,
  };

  return accountStatement;
}

app
  .route("/")
  .get(function (req, res) {
    res.render("login");
  })
  .post(function (req, res) {
    if (req.body.username == "" || req.body.password == "") {
      res.status(204).send();
    } else {
      const user = new userModel({
        username: req.body.username,
        password: req.body.password,
      });
      req.login(user, function (error) {
        if (error) {
        } else {
          passport.authenticate("local")(req, res, function name() {
            if (
              req.body.username == process.env.ADMIN_USERNAME &&
              req.body.password == process.env.ADMIN_PASSWORD
            ) {
              res.redirect("admin");
            } else {
              res.redirect("profile");
            }
          });
        }
      });
    }
  });

app.route("/dashboard").get(function (req, res) {
  if (req.isAuthenticated()) {
    if (req.user.username == process.env.ADMIN_USERNAME) {
      res.redirect("admin");
    } else {
      res.render("dashboard");
    }
  } else {
    res.redirect("/");
  }
});

app
  .route("/admin")
  .get(function (req, res) {
    if (req.isAuthenticated()) {
      if (req.user.username == process.env.ADMIN_USERNAME) {
        memberModel.find(function (err, docs) {
          memberList = [];
          contributionList = [];
          for (const key in docs) {
            memberList.push(docs[key]);
          }

          accountModel.find(function (err, docs) {
            for (const key in docs) {
              var totalcontribution =
                parseFloat(docs[key].sharecapital) +
                parseFloat(docs[key].thriftsavings) +
                parseFloat(docs[key].specialdeposit);
              totalcontribution = totalcontribution.toFixed(2);
              var num_parts = totalcontribution.toString().split(".");
              num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
              finalNumber = num_parts.join(".");
              contributionList.push(finalNumber);
            }
            res.render("admin", {
              memberList: memberList,
              contributionList: contributionList,
            });
          });
        });
      } else {
        res.redirect("dashboard");
      }
    } else {
      res.redirect("/");
    }
  })
  .post(function (req, res) {
    var edit = req.body.adminbutton;

    var final = edit.split(" ");
    memberUsername = final[1];

    res.redirect("/editmember?username=" + memberUsername);
  });

app.route("/logout").get(function (req, res) {
  req.logOut();
  res.redirect("/");
});

app
  .route("/addmember")
  .get(function (req, res) {
    if (req.isAuthenticated()) {
      if (req.user.username == process.env.ADMIN_USERNAME) {
        res.render("addmember");
      } else {
        res.redirect("dashboard");
      }
    } else {
      res.redirect("/");
    }
  })
  .post(function (req, res) {
    userModel.register(
      { username: req.body.username },
      req.body.password,
      function (err, user) {
        if (err) {
          res.send(err);
        } else {
          res.send(user.username);
          const createMember = new memberModel({
            username: req.body.username,
            title: req.body.title,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            middlename: req.body.middlename,
            position: req.body.position,
            membershipstatus: req.body.membershipstatus,
            loanapplicationstatus: req.body.loanapplicationstatus,
            phonenumber: req.body.phonenumber,
            email: req.body.email,
            address: req.body.address,
            gender: req.body.gender,
            occupation: req.body.occupation,
            nextofkin: req.body.nextofkin,
            nextofkinaddress: req.body.nextofkinaddress,
          });
          createMember.save();

          const createAccount = new accountModel({
            username: req.body.username,
            sharecapital: "0.00",
            thriftsavings: "0.00",
            specialdeposit: "0.00",
            commoditytrading: "0.00",
            fine: "0.00",
            loan: "0.00",
            projectfinancing: "0.00",
            transactions: [],
          });
          createAccount.save();
        }
      }
    );
  });

app
  .route("/newssection")
  .get(function (req, res) {
    if (req.isAuthenticated()) {
      if (req.user.username == process.env.ADMIN_USERNAME) {
        newsModel.find(function (err, docs) {
          res.render("newssection", { newsList: docs });
        });
      } else {
        res.redirect("dashboard");
      }
    } else {
      res.redirect("/");
    }
  })
  .post(function (req, res) {
    if (req.body.newsbutton == "Delete news") {
      console.log(req.body);
      newsModel.deleteOne(
        { id: parseInt(req.body.selectednews) },
        function (error) {
          if (error) {
            console.log(error);
          } else {
            res.send("success");
          }
        }
      );
    } else if (req.body.newsbutton == "Post on members profile") {
      console.log(req.body);
      newsModel.find(function (err, docs) {
        const news = new newsModel({
          id: docs.length,
          title: req.body.title,
          content: req.body.content,
          date: req.body.date,
        });
        news.save();
      });
      res.send("success");
    }
  });

app
  .route("/profile")
  .get(function (req, res) {
    // userModel.findOne({username:req.user.username},function (error,document) {
    //   document.setPassword("12345", function(err) {
    //     document.save(function(err){

    //     });
    //   console.log(document);
    // })})
    if (req.isAuthenticated()) {
      if (req.user.username == process.env.ADMIN_USERNAME) {
        res.redirect("admin");
      } else {
        memberModel.findOne(
          { username: req.user.username },
          function (err, doc) {
            username = doc.username;
            title = doc.title;
            firstname = doc.firstname;
            lastname = doc.lastname;
            middlename = doc.middlename;
            position = doc.position;
            membershipstatus = doc.membershipstatus;
            loanapplicationstatus = doc.loanapplicationstatus;
            phonenumber = doc.phonenumber;
            email = doc.email;
            address = doc.address;
            gender = doc.gender;
            occupation = doc.occupation;
            nextofkin = doc.nextofkin;
            nextofkinaddress = doc.nextofkinaddress;

            accountModel.findOne(
              { username: req.user.username },
              function (err, docs) {
                if (err) {
                  console.log(err);
                } else {
                  lastTransactionToProfile = "";
                  if (docs.transactions.length == 0) {
                  } else {
                    lasttransaction =
                      docs.transactions[docs.transactions.length - 1];

                    lastTransactionToProfile =
                      lasttransaction.transactiontype +
                      " of ₦" +
                      lasttransaction.amount +
                      " on " +
                      lasttransaction.account +
                      " account ";
                  }

                  var totalcontribution =
                    parseFloat(docs.sharecapital) +
                    parseFloat(docs.thriftsavings) +
                    parseFloat(docs.specialdeposit);
                  totalcontribution = totalcontribution.toFixed(2);
                  var num_parts = totalcontribution.toString().split(".");
                  num_parts[0] = num_parts[0].replace(
                    /\B(?=(\d{3})+(?!\d))/g,
                    ","
                  );
                  finalTotalContribution = num_parts.join(".");

                  sharecapital = addCommas(docs.sharecapital);
                  thriftsavings = addCommas(docs.thriftsavings);
                  specialdeposit = addCommas(docs.specialdeposit);
                  commoditytrading = addCommas(docs.commoditytrading);
                  fine = addCommas(docs.fine);
                  loan = addCommas(docs.loan);
                  projectfinancing = addCommas(docs.projectfinancing);
                  transactions = docs.transactions;
                  contributions = [];
                  contributionsFinal = [];
                  contributionBalance = [];
                  for (const key in transactions) {
                    if (
                      transactions[key].account == "sharecapital" ||
                      transactions[key].account == "thriftsavings" ||
                      transactions[key].account == "specialdeposit"
                    ) {
                      contributions.push(transactions[key]);
                      if (contributionBalance.length < 1) {
                        contributionBalance.push(
                          addCommas(transactions[key].amount)
                        );
                      } else {
                        currentIndex = contributionBalance.length - 1;
                        currentBalance =
                          parseFloat(contributionBalance[currentIndex]) +
                          parseFloat(transactions[key].amount);

                        currentBalanceToFixed = currentBalance.toFixed(2);

                        contributionBalance.push(currentBalanceToFixed);
                      }
                    } else {
                    }
                  }

                  for (const key in contributionBalance) {
                    number = addCommas(contributionBalance[key]);
                    contributionsFinal.push(number);
                  }
                  numberOfMembers = 0;
                  userModel.find(function (findError, findDocs) {
                    numberOfMembers = findDocs.length - 1;
                  });

                  newsModel.find(function (err, news) {
                    res.render("profile", {
                      loggedInUser: title + " " + firstname + " " + lastname,
                      firstname: firstname,
                      lastname: lastname,
                      middlename: middlename,
                      phonenumber: phonenumber,
                      email: email,
                      address: address,
                      gender: gender,
                      position: position,
                      membershipcount: numberOfMembers,
                      membershipstatus: membershipstatus,
                      lasttransaction: lastTransactionToProfile,
                      loanapplicationstatus: loanapplicationstatus,
                      occupation: occupation,
                      nextofkin: nextofkin,
                      nextofkinaddress: nextofkinaddress,
                      sharecapital: sharecapital,
                      thriftsavings: thriftsavings,
                      specialdeposit: specialdeposit,
                      totalcontribution: finalTotalContribution,
                      commoditytrading: commoditytrading,
                      fine: fine,
                      loan: loan,
                      projectfinancing: projectfinancing,
                      newsList: news,
                      transactionsList: contributions,
                      contributionBalance: contributionsFinal,
                    });
                  });
                }
              }
            );
          }
        );
      }
    } else {
      res.redirect("/");
    }
  })
  .post(function (req, res) {
    console.log(req.body);
    userModel.findOne(
      { username: req.user.username },
      function (err, document) {
        console.log(document);
        document.setPassword(req.body.newpassword, function (err2) {
          document.save(function (err3) {
            res.send("success");
          });
        });
      }
    );
  });

app.route("/statements").get(function (req, res) {
  if (req.isAuthenticated()) {
    if (req.user.username == process.env.ADMIN_USERNAME) {
      res.redirect("admin");
    } else {
      accountModel.findOne(
        { username: req.user.username },
        function (err, docs) {
          totalContributionAccount = [];
          commodityTradingAccount = [];
          fineAccount = [];
          loanAccount = [];
          projectFinancingAccount = [];
          for (const key in docs.transactions) {
            if (docs.transactions[key].account == "loan") {
              if (loanAccount.length == 0) {
                loanAccount.push(
                  createStatements(
                    docs.transactions[key].date,
                    docs.transactions[key].narration,
                    docs.transactions[key].transactiontype,
                    docs.transactions[key].amount
                  )
                );
              } else {
                currentBalanceIndex = loanAccount.length - 1;

                loanAccount.push(
                  addToStatement(
                    loanAccount[currentBalanceIndex].balance,
                    docs.transactions[key].amount,
                    docs.transactions[key].date,
                    docs.transactions[key].narration,
                    docs.transactions[key].transactiontype
                  )
                );
              }
            } else if (docs.transactions[key].account == "fine") {
              if (fineAccount.length == 0) {
                fineAccount.push(
                  createStatements(
                    docs.transactions[key].date,
                    docs.transactions[key].narration,
                    docs.transactions[key].transactiontype,
                    docs.transactions[key].amount
                  )
                );
              } else {
                currentBalanceIndex = fineAccount.length - 1;

                fineAccount.push(
                  addToStatement(
                    fineAccount[currentBalanceIndex].balance,
                    docs.transactions[key].amount,
                    docs.transactions[key].date,
                    docs.transactions[key].narration,
                    docs.transactions[key].transactiontype
                  )
                );
              }
            } else if (docs.transactions[key].account == "commoditytrading") {
              if (loanAccount.length == 0) {
                commodityTradingAccount.push(
                  createStatements(
                    docs.transactions[key].date,
                    docs.transactions[key].narration,
                    docs.transactions[key].transactiontype,
                    docs.transactions[key].amount
                  )
                );
              } else {
                currentBalanceIndex = commodityTradingAccount.length - 1;

                commodityTradingAccount.push(
                  addToStatement(
                    commodityTradingAccount[currentBalanceIndex].balance,
                    docs.transactions[key].amount,
                    docs.transactions[key].date,
                    docs.transactions[key].narration,
                    docs.transactions[key].transactiontype
                  )
                );
              }
            } else if (docs.transactions[key].account == "projectfinancing") {
              if (projectFinancingAccount.length == 0) {
                projectFinancingAccount.push(
                  createStatements(
                    docs.transactions[key].date,
                    docs.transactions[key].narration,
                    docs.transactions[key].transactiontype,
                    docs.transactions[key].amount
                  )
                );
              } else {
                currentBalanceIndex = projectFinancingAccount.length - 1;

                projectFinancingAccount.push(
                  addToStatement(
                    projectFinancingAccount[currentBalanceIndex].balance,
                    docs.transactions[key].amount,
                    docs.transactions[key].date,
                    docs.transactions[key].narration,
                    docs.transactions[key].transactiontype
                  )
                );
              }
            } else if (docs.transactions[key].account == "sharecapital") {
              if (totalContributionAccount.length == 0) {
                finalShareCapitalBalanceToFixed = parseFloat(
                  docs.transactions[key].amount.replace(/,/g, "")
                ).toFixed(2);
                finalBalanceToFixed = parseFloat(
                  docs.transactions[key].amount.replace(/,/g, "")
                ).toFixed(2);
                transactions = {
                  date: docs.transactions[key].date,
                  narration: docs.transactions[key].narration,
                  transactiontype: docs.transactions[key].transactiontype,
                  amount: docs.transactions[key].amount,
                  sharecapital: addCommas(finalShareCapitalBalanceToFixed),
                  thriftsavings: "0.00",
                  specialdeposit: "0.00",
                  balance: addCommas(finalBalanceToFixed),
                };
                totalContributionAccount.push(transactions);
              } else {
                currentBalanceIndex = totalContributionAccount.length - 1;

                finalShareCapitalBalance =
                  parseFloat(
                    totalContributionAccount[
                      currentBalanceIndex
                    ].sharecapital.replace(/,/g, "")
                  ) +
                  parseFloat(docs.transactions[key].amount.replace(/,/g, ""));

                finalBalance =
                  parseFloat(
                    totalContributionAccount[
                      currentBalanceIndex
                    ].balance.replace(/,/g, "")
                  ) +
                  parseFloat(docs.transactions[key].amount.replace(/,/g, ""));

                finalShareCapitalBalanceToFixed = finalShareCapitalBalance.toFixed(
                  2
                );
                finalBalanceToFixed = finalBalance.toFixed(2);
                transactions = {
                  date: docs.transactions[key].date,
                  narration: docs.transactions[key].narration,
                  transactiontype: docs.transactions[key].transactiontype,
                  amount: docs.transactions[key].amount,
                  sharecapital: addCommas(finalShareCapitalBalanceToFixed),
                  thriftsavings:
                    totalContributionAccount[currentBalanceIndex].thriftsavings,
                  specialdeposit:
                    totalContributionAccount[currentBalanceIndex]
                      .specialdeposit,
                  balance: addCommas(finalBalanceToFixed),
                };
                totalContributionAccount.push(transactions);
              }
            } else if (docs.transactions[key].account == "thriftsavings") {
              if (totalContributionAccount.length == 0) {
                finalThriftSavingsBalanceToFixed = parseFloat(
                  docs.transactions[key].amount.replace(/,/g, "")
                ).toFixed(2);
                finalBalanceToFixed = parseFloat(
                  docs.transactions[key].amount.replace(/,/g, "")
                ).toFixed(2);

                transactions = {
                  date: docs.transactions[key].date,
                  narration: docs.transactions[key].narration,
                  transactiontype: docs.transactions[key].transactiontype,
                  amount: docs.transactions[key].amount,
                  sharecapital: "0.00",
                  thriftsavings: addCommas(finalThriftSavingsBalanceToFixed),
                  specialdeposit: "0.00",
                  balance: finalBalanceToFixed,
                };
                totalContributionAccount.push(transactions);
              } else {
                currentBalanceIndex = totalContributionAccount.length - 1;

                finalThriftSavingsBalance =
                  parseFloat(
                    totalContributionAccount[
                      currentBalanceIndex
                    ].thriftsavings.replace(/,/g, "")
                  ) +
                  parseFloat(docs.transactions[key].amount.replace(/,/g, ""));

                finalThriftSavingsBalanceToFixed = finalThriftSavingsBalance.toFixed(
                  2
                );

                finalBalance =
                  parseFloat(
                    totalContributionAccount[
                      currentBalanceIndex
                    ].balance.replace(/,/g, "")
                  ) +
                  parseFloat(docs.transactions[key].amount.replace(/,/g, ""));

                finalBalanceToFixed = finalBalance.toFixed(2);
                transactions = {
                  date: docs.transactions[key].date,
                  narration: docs.transactions[key].narration,
                  transactiontype: docs.transactions[key].transactiontype,
                  amount: docs.transactions[key].amount,
                  sharecapital:
                    totalContributionAccount[currentBalanceIndex].sharecapital,
                  thriftsavings: addCommas(finalThriftSavingsBalanceToFixed),
                  specialdeposit:
                    totalContributionAccount[currentBalanceIndex]
                      .specialdeposit,
                  balance: addCommas(finalBalanceToFixed),
                };
                totalContributionAccount.push(transactions);
              }
            } else if (docs.transactions[key].account == "specialdeposit") {
              if (totalContributionAccount.length == 0) {
                finalSpecialDepositBalanceToFixed = parseFloat(
                  docs.transactions[key].amount.replace(/,/g, "")
                ).toFixed(2);
                finalBalanceToFixed = parseFloat(
                  docs.transactions[key].amount.replace(/,/g, "")
                ).toFixed(2);

                transactions = {
                  date: docs.transactions[key].date,
                  narration: docs.transactions[key].narration,
                  transactiontype: docs.transactions[key].transactiontype,
                  amount: docs.transactions[key].amount,
                  sharecapital: "0.00",
                  thriftsavings: "0.00",
                  specialdeposit: addCommas(finalSpecialDepositBalanceToFixed),
                  balance: addCommas(finalBalanceToFixed),
                };
                totalContributionAccount.push(transactions);
              } else {
                currentBalanceIndex = totalContributionAccount.length - 1;

                finalSpecialDepositBalance =
                  parseFloat(
                    totalContributionAccount[
                      currentBalanceIndex
                    ].specialdeposit.replace(/,/g, "")
                  ) +
                  parseFloat(docs.transactions[key].amount.replace(/,/g, ""));

                finalBalance =
                  parseFloat(
                    totalContributionAccount[
                      currentBalanceIndex
                    ].balance.replace(/,/g, "")
                  ) +
                  parseFloat(docs.transactions[key].amount.replace(/,/g, ""));

                finalSpecialDepositBalanceToFixed = finalSpecialDepositBalance.toFixed(
                  2
                );
                finalBalanceToFixed = finalBalance.toFixed(2);

                transactions = {
                  date: docs.transactions[key].date,
                  narration: docs.transactions[key].narration,
                  transactiontype: docs.transactions[key].transactiontype,
                  amount: docs.transactions[key].amount,
                  sharecapital:
                    totalContributionAccount[currentBalanceIndex].sharecapital,
                  thriftsavings:
                    totalContributionAccount[currentBalanceIndex].thriftsavings,
                  specialdeposit: addCommas(finalSpecialDepositBalanceToFixed),
                  balance: addCommas(finalBalanceToFixed),
                };
                totalContributionAccount.push(transactions);
              }
            }
          }

          res.render("statements", {
            loanstatement: loanAccount,
            finestatement: fineAccount,
            commoditytradingstatement: commodityTradingAccount,
            projectfinancingstatement: projectFinancingAccount,
            totalcontributionstatement: totalContributionAccount,
          });
        }
      );
    }
  } else {
    res.redirect("/");
  }
});

app
  .route("/editmember")
  .get(function (req, res) {
    if (req.isAuthenticated()) {
      if (req.user.username == process.env.ADMIN_USERNAME) {
        var username = req.query.username;
        memberModel.findOne({ username: username }, function (err, doc) {
          res.render("editmember", {
            username: doc.username,
            title: doc.title,
            firstname: doc.firstname,
            lastname: doc.lastname,
            middlename: doc.middlename,
            position: doc.position,
            membershipstatus: doc.membershipstatus,
            loanapplicationstatus: doc.loanapplicationstatus,
            phonenumber: doc.phonenumber,
            email: doc.email,
            address: doc.address,
            gender: doc.gender,
            occupation: doc.occupation,
            nextofkin: doc.nextofkin,
            nextofkinaddress: doc.nextofkinaddress,
            result: true,
          });
        });
      } else {
        res.redirect("dashboard");
      }
    } else {
      res.redirect("/");
    }
  })
  .post(function (req, res) {
    if (req.body.updatebutton === "Update User") {
      memberModel.updateOne(
        { username: req.body.username },
        {
          username: req.body.username,
          title: req.body.title,
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          middlename: req.body.middlename,
          position: req.body.position,
          membershipstatus: req.body.membershipstatus,
          loanapplicationstatus: req.body.loanapplicationstatus,
          phonenumber: req.body.phonenumber,
          email: req.body.email,
          address: req.body.address,
          gender: req.body.gender,
          occupation: req.body.occupation,
          nextofkin: req.body.nextofkin,
          nextofkinaddress: req.body.nextofkinaddress,
        },
        function (err, result) {
          if (err) {
          } else {
            res.send(result);
          }
        }
      );
    } else if (req.body.updatebutton === "Credit Member Account") {
      accountModel.findOne(
        {
          username: req.body.username,
        },
        function (err, doc) {
          if (err) {
            res.send(err);
          } else {
            if (req.body.creditselect == "sharecapital") {
              var totalShareCapital =
                parseFloat(doc.sharecapital) +
                parseFloat(req.body.creditamount);

              creditDebitAccount(
                "credit",
                "sharecapital",
                req.body.creditamount,
                req.body.creditdescription,
                req.body.creditdate,
                req.body.username,
                totalShareCapital.toFixed(2),
                doc.thriftsavings,
                doc.specialdeposit,
                doc.commoditytrading,
                doc.fine,
                doc.loan,
                doc.projectfinancing,
                res
              );
            } else if (req.body.creditselect == "thriftsavings") {
              var totalThriftSavings =
                parseFloat(doc.thriftsavings) +
                parseFloat(req.body.creditamount);

              creditDebitAccount(
                "credit",
                "thriftsavings",
                req.body.creditamount,
                req.body.creditdescription,
                req.body.creditdate,
                req.body.username,
                doc.sharecapital,
                totalThriftSavings.toFixed(2),
                doc.specialdeposit,
                doc.commoditytrading,
                doc.fine,
                doc.loan,
                doc.projectfinancing,
                res
              );
            } else if (req.body.creditselect == "specialdeposit") {
              var totalSpecialDeposit =
                parseFloat(doc.specialdeposit) +
                parseFloat(req.body.creditamount);

              creditDebitAccount(
                "credit",
                "specialdeposit",
                req.body.creditamount,
                req.body.creditdescription,
                req.body.creditdate,
                req.body.username,
                doc.sharecapital,
                doc.thriftsavings,
                totalSpecialDeposit.toFixed(2),
                doc.commoditytrading,
                doc.fine,
                doc.loan,
                doc.projectfinancing,
                res
              );
            } else if (req.body.creditselect == "commoditytrading") {
              var totalCommodityTrading =
                parseFloat(doc.commoditytrading) +
                parseFloat(req.body.creditamount);

              creditDebitAccount(
                "credit",
                "commoditytrading",
                req.body.creditamount,
                req.body.creditdescription,
                req.body.creditdate,
                req.body.username,
                doc.sharecapital,
                doc.thriftsavings,
                doc.specialdeposit,
                totalCommodityTrading.toFixed(2),
                doc.fine,
                doc.loan,
                doc.projectfinancing,
                res
              );
            } else if (req.body.creditselect == "fine") {
              var totalFine =
                parseFloat(doc.fine) + parseFloat(req.body.creditamount);

              creditDebitAccount(
                "credit",
                "fine",
                req.body.creditamount,
                req.body.creditdescription,
                req.body.creditdate,
                req.body.username,
                doc.sharecapital,
                doc.thriftsavings,
                doc.specialdeposit,
                doc.commoditytrading,
                totalFine.toFixed(2),
                doc.loan,
                doc.projectfinancing,
                res
              );
            } else if (req.body.creditselect == "loan") {
              var totalLoan =
                parseFloat(doc.loan) + parseFloat(req.body.creditamount);

              creditDebitAccount(
                "credit",
                "loan",
                req.body.creditamount,
                req.body.creditdescription,
                req.body.creditdate,
                req.body.username,
                doc.sharecapital,
                doc.thriftsavings,
                doc.specialdeposit,
                doc.commoditytrading,
                doc.fine,
                totalLoan.toFixed(2),
                doc.projectfinancing,
                res
              );
            } else if (req.body.creditselect == "projectfinancing") {
              var totalProjectFinancing =
                parseFloat(doc.projectfinancing) +
                parseFloat(req.body.creditamount);

              creditDebitAccount(
                "credit",
                "projectfinancing",
                req.body.creditamount,
                req.body.creditdescription,
                req.body.creditdate,
                req.body.username,
                doc.sharecapital,
                doc.thriftsavings,
                doc.specialdeposit,
                doc.commoditytrading,
                doc.fine,
                doc.loan,
                totalProjectFinancing.toFixed(2),
                res
              );
            }
          }
        }
      );
    } else if (req.body.updatebutton === "Debit Member Account") {
      accountModel.findOne(
        {
          username: req.body.username,
        },
        function (err, doc) {
          if (err) {
            res.send(err);
          } else {
            if (req.body.debitselect == "sharecapital") {
              var totalShareCapital =
                parseFloat(doc.sharecapital) - parseFloat(req.body.debitamount);

              creditDebitAccount(
                "debit",
                "sharecapital",
                "-" + req.body.debitamount,
                req.body.debitdescription,
                req.body.debitdate,
                req.body.username,
                totalShareCapital.toFixed(2),
                doc.thriftsavings,
                doc.specialdeposit,
                doc.commoditytrading,
                doc.fine,
                doc.loan,
                doc.projectfinancing,
                res
              );
            } else if (req.body.debitselect == "thriftsavings") {
              var totalThriftSavings =
                parseFloat(doc.thriftsavings) -
                parseFloat(req.body.debitamount);

              creditDebitAccount(
                "debit",
                "thriftsavings",
                "-" + req.body.debitamount,
                req.body.debitdescription,
                req.body.debitdate,
                req.body.username,
                doc.sharecapital,
                totalThriftSavings.toFixed(2),
                doc.specialdeposit,
                doc.commoditytrading,
                doc.fine,
                doc.loan,
                doc.projectfinancing,
                res
              );
            } else if (req.body.debitselect == "specialdeposit") {
              var totalSpecialDeposit =
                parseFloat(doc.specialdeposit) -
                parseFloat(req.body.debitamount);

              creditDebitAccount(
                "debit",
                "specialdeposit",
                "-" + req.body.debitamount,
                req.body.debitdescription,
                req.body.debitdate,
                req.body.username,
                doc.sharecapital,
                doc.thriftsavings,
                totalSpecialDeposit.toFixed(2),
                doc.commoditytrading,
                doc.fine,
                doc.loan,
                doc.projectfinancing,
                res
              );
            } else if (req.body.debitselect == "commoditytrading") {
              var totalCommodityTrading =
                parseFloat(doc.commoditytrading) -
                parseFloat(req.body.debitamount);

              creditDebitAccount(
                "debit",
                "commoditytrading",
                "-" + req.body.debitamount,
                req.body.debitdescription,
                req.body.debitdate,
                req.body.username,
                doc.sharecapital,
                doc.thriftsavings,
                doc.specialdeposit,
                totalCommodityTrading.toFixed(2),
                doc.fine,
                doc.loan,
                doc.projectfinancing,
                res
              );
            } else if (req.body.debitselect == "fine") {
              var totalFine =
                parseFloat(doc.fine) - parseFloat(req.body.debitamount);

              creditDebitAccount(
                "debit",
                "fine",
                "-" + req.body.debitamount,
                req.body.debitdescription,
                req.body.debitdate,
                req.body.username,
                doc.sharecapital,
                doc.thriftsavings,
                doc.specialdeposit,
                doc.commoditytrading,
                totalFine.toFixed(2),
                doc.loan,
                doc.projectfinancing,
                res
              );
            } else if (req.body.debitselect == "loan") {
              var totalLoan =
                parseFloat(doc.loan) - parseFloat(req.body.debitamount);

              creditDebitAccount(
                "debit",
                "loan",
                "-" + req.body.debitamount,
                req.body.debitdescription,
                req.body.debitdate,
                req.body.username,
                doc.sharecapital,
                doc.thriftsavings,
                doc.specialdeposit,
                doc.commoditytrading,
                doc.fine,
                totalLoan.toFixed(2),
                doc.projectfinancing,
                res
              );
            } else if (req.body.debitselect == "projectfinancing") {
              var totalProjectFinancing =
                parseFloat(doc.projectfinancing) -
                parseFloat(req.body.debitamount);

              creditDebitAccount(
                "debit",
                "projectfinancing",
                "-" + req.body.debitamount,
                req.body.debitdescription,
                req.body.debitdate,
                req.body.username,
                doc.sharecapital,
                doc.thriftsavings,
                doc.specialdeposit,
                doc.commoditytrading,
                doc.fine,
                doc.loan,
                totalProjectFinancing.toFixed(2),
                res
              );
            }
          }
        }
      );
    }
  })
  .delete(function (req, res) {
    accountModel.deleteOne({ username: req.body.username }, function (err) {
      if (err) {
      } else {
      }
    });

    memberModel.deleteOne({ username: req.body.username }, function (err) {
      if (err) {
      } else {
      }
    });

    userModel.deleteOne({ username: req.body.username }, function (err) {
      if (err) {
      } else {
        res.send({ message: "deleted successfully" });
      }
    });
  });

app.route("/json/accounts").get(function (req, res) {
  if (req.query.api_key == process.env.API_KEY) {
    accountModel.find(function (err, docs) {
      res.send(docs);
    });
  } else {
    res.send("Unauthorized (you do not have permission to view this page)");
  }
});

app.route("/json/members").get(function (req, res) {
  if (req.query.api_key == process.env.API_KEY) {
    memberModel.find(function (err, docs) {
      res.send(docs);
    });
  } else {
    res.send("Unauthorized (you do not have permission to view this page)");
  }
});

app.route("/json/users").get(function (req, res) {
  if (req.query.api_key == process.env.API_KEY) {
    userModel.find(function (err, docs) {
      res.send(docs);
    });
  } else {
    res.send("Unauthorized (you do not have permission to view this page)");
  }
});

app.route("/json/news").get(function (req, res) {
  if (req.query.api_key == process.env.API_KEY) {
    newsModel.find(function (err, docs) {
      res.send(docs);
    });
  } else {
    res.send("Unauthorized (you do not have permission to view this page)");
  }
});

app.route("/json/login").post(function (req, res) {
  if (req.query.api_key == process.env.API_KEY) {
    if (req.body.username == "" || req.body.password == "") {
      res.send({ message: "Error" });
    } else {
      const user = new userModel({
        username: req.body.username,
        password: req.body.password,
      });
      req.login(user, function (error) {
        if (error) {
          res.send({ message: "Error" });
        } else {
          passport.authenticate("local")(req, res, function name() {
            if (
              req.body.username == process.env.ADMIN_USERNAME &&
              req.body.password == process.env.ADMIN_PASSWORD
            ) {
              res.send("Admin logged in");
            } else {
              res.send({ message: "success", user: req.user });
            }
          });
        }
      });
    }
  } else {
    res.send("Unauthorized (you do not have permission to view this page)");
  }
});
