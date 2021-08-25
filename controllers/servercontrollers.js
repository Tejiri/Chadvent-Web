const userModel = require("../models/usermodel");
const passport = require("passport");
const accountModel = require("../models/accountmodels");
const memberModel = require("../models/membermodels");
const newsModel = require("../models/newsmodel");

var memberList = [];
var contributionList = ["fdsdfds", "dffdsfsd"];

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

const homeGet = function (req, res) {
  res.render("login");
};

const homePost = function (req, res) {
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
            req.body.username == process.env.ATLAS_USERNAME &&
            req.body.password == process.env.ATLAS_PASSWORD
          ) {
            res.redirect("admin");
          } else {
            res.redirect("profile");
          }
        });
      }
    });
  }
};

const dashboardGet = function (req, res) {
  if (req.isAuthenticated()) {
    if (req.user.username == process.env.ADMIN_USERNAME) {
      res.redirect("admin");
    } else {
      res.render("dashboard");
    }
  } else {
    res.redirect("/");
  }
};

const adminGet = function (req, res) {
  if (req.isAuthenticated()) {
    if (req.user.username == process.env.ADMIN_USERNAME) {
      memberModel.find(function (err, docs) {
        memberList = [];
        contributionList = [];
        for (const key in docs) {
          memberList.push(docs[key]);
        }

        accountModel.find(function (err, docs) {
          var totalShareCapital = 0;
          var totalThriftSavings = 0;
          var totalSpecialDeposit = 0;
          var totalCommodityTrading = 0;
          var totalFine = 0;
          var totalLoan = 0;
          var totalProjectFinancing = 0;
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
            totalShareCapital =
              parseFloat(totalShareCapital) +
              parseFloat(docs[key].sharecapital);
            totalThriftSavings =
              parseFloat(totalThriftSavings) +
              parseFloat(docs[key].thriftsavings);
            totalSpecialDeposit =
              parseFloat(totalSpecialDeposit) +
              parseFloat(docs[key].specialdeposit);
            totalCommodityTrading =
              parseFloat(totalCommodityTrading) +
              parseFloat(docs[key].commoditytrading);
            totalFine = parseFloat(totalFine) + parseFloat(docs[key].fine);
            totalLoan = parseFloat(totalLoan) + parseFloat(docs[key].loan);
            totalProjectFinancing =
              parseFloat(totalProjectFinancing) +
              parseFloat(docs[key].projectfinancing);
          }

          res.render("admin", {
            memberList: memberList,
            contributionList: contributionList,
            totalShareCapital: addCommas(totalShareCapital),
            totalThriftSavings: addCommas(totalThriftSavings),
            totalSpecialDeposit: addCommas(totalSpecialDeposit),
            totalCommodityTrading: addCommas(totalCommodityTrading),
            totalFine: addCommas(totalFine),
            totalLoan: addCommas(totalLoan),
            totalProjectFinancing: addCommas(totalProjectFinancing),
          });
        });
      });
    } else {
      res.redirect("dashboard");
    }
  } else {
    res.redirect("/");
  }
};

const adminPost = function (req, res) {
  var edit = req.body.adminbutton;

  var final = edit.split(" ");
  memberUsername = final[1];

  res.redirect("/editmember?username=" + memberUsername);
};

const logoutGet = function (req, res) {
  req.logOut();
  res.redirect("/");
};

const jsonAccountsGet = function (req, res) {
  if (req.query.api_key == process.env.API_KEY) {
    accountModel.find(function (err, docs) {
      if (err) {
        res.send(err);
      }
      res.send(docs);
    });
  } else {
    res.send("Unauthorized (you do not have permission to view this page)");
  }
};

const jsonMembersGet = function (req, res) {
  if (req.query.api_key == process.env.API_KEY) {
    memberModel.find(function (err, docs) {
      res.send(docs);
    });
  } else {
    res.send("Unauthorized (you do not have permission to view this page)");
  }
};

const jsonUsersGet = function (req, res) {
  if (req.query.api_key == process.env.API_KEY) {
    userModel.find(function (err, docs) {
      res.send(docs);
    });
  } else {
    res.send("Unauthorized (you do not have permission to view this page)");
  }
};

const jsonNewsGet = function (req, res) {
  if (req.query.api_key == process.env.API_KEY) {
    newsModel.find(function (err, docs) {
      res.send(docs);
    });
  } else {
    res.send("Unauthorized (you do not have permission to view this page)");
  }
};

const jsonLoginPost = function (req, res) {
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
};

const addMemberGet = function (req, res) {
  if (req.isAuthenticated()) {
    if (req.user.username == process.env.ADMIN_USERNAME) {
      res.render("addmember");
    } else {
      res.redirect("dashboard");
    }
  } else {
    res.redirect("/");
  }
};

const addMemberPost = function (req, res) {
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
          bank: req.body.bank,
          accountnumber: req.body.accountnumber,
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
};

const newsSectionGet = function (req, res) {
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
};

const newsSectionPost = function (req, res) {
  if (req.body.newsbutton == "Delete news") {
    newsModel.deleteOne(
      { id: parseInt(req.body.selectednews) },
      function (error) {
        if (error) {
        } else {
          res.send("success");
        }
      }
    );
  } else if (req.body.newsbutton == "Post on members profile") {
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
};

const statementsGet = function (req, res) {
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

                finalShareCapitalBalanceToFixed =
                  finalShareCapitalBalance.toFixed(2);
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

                finalThriftSavingsBalanceToFixed =
                  finalThriftSavingsBalance.toFixed(2);

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

                finalSpecialDepositBalanceToFixed =
                  finalSpecialDepositBalance.toFixed(2);
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

          memberModel.findOne(
            { username: req.user.username },
            function (err, doc) {
              res.render("statements", {
                username: req.user.username,
                title: doc.title,
                firstname: doc.firstname,
                lastname: doc.lastname,
                loanstatement: loanAccount,
                finestatement: fineAccount,
                commoditytradingstatement: commodityTradingAccount,
                projectfinancingstatement: projectFinancingAccount,
                totalcontributionstatement: totalContributionAccount,
              });
            }
          );
        }
      );
    }
  } else {
    res.redirect("/");
  }
};

const profileGet = function (req, res) {
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
      memberModel.findOne({ username: req.user.username }, function (err, doc) {
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
        bank = doc.bank;
        accountnumber = doc.accountnumber;

        accountModel.findOne(
          { username: req.user.username },
          function (err, docs) {
            if (err) {
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
              num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
                  bank: bank,
                  accountnumber: accountnumber,
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
      });
    }
  } else {
    res.redirect("/");
  }
};

const profilePost = function (req, res) {
  if (req.body.adminusernametoreset == undefined) {
    userModel.findOne(
      { username: req.user.username },
      function (err, document) {
        document.setPassword(req.body.newpassword, function (err2) {
          document.save(function (err3) {
            res.send("success");
          });
        });
      }
    );
  } else {
    userModel.findOne(
      { username: req.body.adminusernametoreset },
      function (err, document) {
        document.setPassword(req.body.adminusernametoreset, function (err2) {
          document.save(function (err3) {
            res.send("success");
          });
        });
      }
    );
  }
};

module.exports = {
  homeGet: homeGet,
  homePost: homePost,
  dashboardGet: dashboardGet,
  adminGet: adminGet,
  adminPost: adminPost,
  logoutGet: logoutGet,
  jsonAccountsGet: jsonAccountsGet,
  jsonMembersGet: jsonMembersGet,
  jsonUsersGet: jsonUsersGet,
  jsonNewsGet: jsonNewsGet,
  jsonLoginPost: jsonLoginPost,
  addMemberGet: addMemberGet,
  addMemberPost: addMemberPost,
  newsSectionGet: newsSectionGet,
  newsSectionPost: newsSectionPost,
  statementsGet: statementsGet,
  profileGet: profileGet,
  profilePost: profilePost,
};
