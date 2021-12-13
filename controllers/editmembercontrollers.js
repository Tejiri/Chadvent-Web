const userModel = require("../models/usermodel");
const accountModel = require("../models/accountmodels");
const memberModel = require("../models/membermodels");
const { json } = require("express");

var memberList = [];
var contributionList = ["fdsdfds", "dffdsfsd"];
var transaction = {};
var contributionBalance = [];
var fineBalance = [];
var loanBalance = [];
var CommodityTradingBalance = [];
var projectFinancingBalance = [];
var totalContributionkeys = [];
var loanKeys = [];
var fineKeys = [];
var commodityTradingKeys = [];
var projectFinancingKeys = [];

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

const editMemberGet = function (req, res) {
  if (req.isAuthenticated()) {
    if (req.user.username == process.env.ADMIN_USERNAME) {
      var username = req.query.username;
      memberModel.findOne({ username: username }, function (err, doc) {
        accountModel.findOne({ username: username }, function (err, docs) {
          totalContributionAccount = [];
          commodityTradingAccount = [];
          fineAccount = [];
          loanAccount = [];
          projectFinancingAccount = [];
          totalContributionkeys = [];
          loanKeys = [];
          fineKeys = [];
          commodityTradingKeys = [];
          projectFinancingKeys = [];
          for (const key in docs.transactions) {
            if (docs.transactions[key].account == "loan") {
              loanKeys.push(key);
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
              fineKeys.push(key);
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
              commodityTradingKeys.push(key);
              if (commodityTradingAccount.length == 0) {
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
              projectFinancingKeys.push(key);
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
              totalContributionkeys.push(key);
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
              totalContributionkeys.push(key);
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
              totalContributionkeys.push(key);
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
            bank: doc.bank,
            accountnumber: doc.accountnumber,
            result: true,
            loanstatement: loanAccount,
            finestatement: fineAccount,
            commoditytradingstatement: commodityTradingAccount,
            projectfinancingstatement: projectFinancingAccount,
            totalcontributionstatement: totalContributionAccount,
            totalContributionkeys: totalContributionkeys,
            loanKeys: loanKeys,
            fineKeys: fineKeys,
            projectFinancingKeys: projectFinancingKeys,
            commodityTradingKeys: commodityTradingKeys,
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

const editMemberPost = function (req, res) {
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
        bank: req.body.bank,
        accountnumber: req.body.accountnumber,
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
              parseFloat(doc.sharecapital) + parseFloat(req.body.creditamount);

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
              parseFloat(doc.thriftsavings) + parseFloat(req.body.creditamount);

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
              parseFloat(doc.thriftsavings) - parseFloat(req.body.debitamount);

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
              parseFloat(doc.specialdeposit) - parseFloat(req.body.debitamount);

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
  } else {
    var button = req.body.updatebutton;
    console.log(button);
    // console.log(button);
    var list = button.split(" ");
    // console.log(list);
    accountModel.findOne({ username: list[1] }, function (err, docs) {
      if (err) {
        res.send(err);
      }
      for (const key in docs.transactions) {
        if (key == list[0]) {
          var tran = {
            _id: docs.transactions[key]._id,
            transactiontype: docs.transactions[key].transactiontype,
            account: docs.transactions[key].account,
            amount: docs.transactions[key].amount,
            narration: docs.transactions[key].narration,
            date: docs.transactions[key].date,
            user: list[1],
          };

          // res.json(tran);
          // console.log(tran);
          res.redirect("edittransaction?valid=" + JSON.stringify(tran));
          // console.log(tran);
          // if (tran.transactiontype == "credit") {
          //   var account = tran.account;
          //   var amount = tran.amount;
          //   switch (account) {
          //     case "sharecapital":
          //       var finalValue =
          //         parseFloat(docs.sharecapital) - parseFloat(amount);
          //       accountModel.findOneAndUpdate(
          //         { username: list[1] },
          //         { sharecapital: finalValue.toFixed(2) },
          //         function (err, doc) {
          //           if (err) {
          //           } else {
          //             accountModel.findOneAndUpdate(
          //               { username: list[1] },
          //               { $pull: { transactions: { _id: tran._id } } },
          //               { safe: true, upsert: true },
          //               function (err, doc) {
          //                 if (err) {
          //                 } else {
          //                   var data = {
          //                     ok: 1,
          //                   };
          //                   res.json(data);
          //                 }
          //               }
          //             );
          //           }
          //         }
          //       );
          //       break;
          //     case "thriftsavings":
          //       var finalValue =
          //         parseFloat(docs.thriftsavings) - parseFloat(amount);
          //       accountModel.findOneAndUpdate(
          //         { username: list[1] },
          //         { thriftsavings: finalValue.toFixed(2) },
          //         function (err, doc) {
          //           if (err) {
          //           } else {
          //             accountModel.findOneAndUpdate(
          //               { username: list[1] },
          //               { $pull: { transactions: { _id: tran._id } } },
          //               { safe: true, upsert: true },
          //               function (err, doc) {
          //                 if (err) {
          //                 } else {
          //                   var data = {
          //                     ok: 1,
          //                   };
          //                   res.json(data);
          //                 }
          //               }
          //             );
          //           }
          //         }
          //       );
          //       break;
          //     case "specialdeposit":
          //       var finalValue =
          //         parseFloat(docs.specialdeposit) - parseFloat(amount);
          //       accountModel.findOneAndUpdate(
          //         { username: list[1] },
          //         { specialdeposit: finalValue.toFixed(2) },
          //         function (err, doc) {
          //           if (err) {
          //           } else {
          //             accountModel.findOneAndUpdate(
          //               { username: list[1] },
          //               { $pull: { transactions: { _id: tran._id } } },
          //               { safe: true, upsert: true },
          //               function (err, doc) {
          //                 if (err) {
          //                 } else {
          //                   var data = {
          //                     ok: 1,
          //                   };
          //                   res.json(data);
          //                 }
          //               }
          //             );
          //           }
          //         }
          //       );
          //       break;
          //     case "commoditytrading":
          //       var finalValue =
          //         parseFloat(docs.commoditytrading) - parseFloat(amount);
          //       accountModel.findOneAndUpdate(
          //         { username: list[1] },
          //         { commoditytrading: finalValue.toFixed(2) },
          //         function (err, doc) {
          //           if (err) {
          //           } else {
          //             accountModel.findOneAndUpdate(
          //               { username: list[1] },
          //               { $pull: { transactions: { _id: tran._id } } },
          //               { safe: true, upsert: true },
          //               function (err, doc) {
          //                 if (err) {
          //                 } else {
          //                   var data = {
          //                     ok: 1,
          //                   };
          //                   res.json(data);
          //                 }
          //               }
          //             );
          //           }
          //         }
          //       );
          //       break;
          //     case "fine":
          //       var finalValue = parseFloat(docs.fine) - parseFloat(amount);
          //       accountModel.findOneAndUpdate(
          //         { username: list[1] },
          //         { fine: finalValue.toFixed(2) },
          //         function (err, doc) {
          //           if (err) {
          //           } else {
          //             accountModel.findOneAndUpdate(
          //               { username: list[1] },
          //               { $pull: { transactions: { _id: tran._id } } },
          //               { safe: true, upsert: true },
          //               function (err, doc) {
          //                 if (err) {
          //                 } else {
          //                   var data = {
          //                     ok: 1,
          //                   };
          //                   res.json(data);
          //                 }
          //               }
          //             );
          //           }
          //         }
          //       );
          //       break;
          //     case "loan":
          //       var finalValue = parseFloat(docs.loan) - parseFloat(amount);
          //       accountModel.findOneAndUpdate(
          //         { username: list[1] },
          //         { loan: finalValue.toFixed(2) },
          //         function (err, doc) {
          //           if (err) {
          //           } else {
          //             accountModel.findOneAndUpdate(
          //               { username: list[1] },
          //               { $pull: { transactions: { _id: tran._id } } },
          //               { safe: true, upsert: true },
          //               function (err, doc) {
          //                 if (err) {
          //                 } else {
          //                   var data = {
          //                     ok: 1,
          //                   };
          //                   res.json(data);
          //                 }
          //               }
          //             );
          //           }
          //         }
          //       );
          //       break;
          //     case "projectfinancing":
          //       var finalValue =
          //         parseFloat(docs.projectfinancing) - parseFloat(amount);
          //       accountModel.findOneAndUpdate(
          //         { username: list[1] },
          //         { projectfinancing: finalValue.toFixed(2) },
          //         function (err, doc) {
          //           if (err) {
          //           } else {
          //             accountModel.findOneAndUpdate(
          //               { username: list[1] },
          //               { $pull: { transactions: { _id: tran._id } } },
          //               { safe: true, upsert: true },
          //               function (err, doc) {
          //                 if (err) {
          //                 } else {
          //                   var data = {
          //                     ok: 1,
          //                   };
          //                   res.json(data);
          //                 }
          //               }
          //             );
          //           }
          //         }
          //       );
          //       break;
          //     default:
          //       break;
          //   }
          // } else {
          //   var account = tran.account;
          //   var amount = tran.amount;
          //   var amountList = amount.split("-");
          //   amount = amountList[1];
          //   switch (account) {
          //     case "sharecapital":
          //       var finalValue =
          //         parseFloat(docs.sharecapital) + parseFloat(amount);
          //       accountModel.findOneAndUpdate(
          //         { username: list[1] },
          //         { sharecapital: finalValue.toFixed(2) },
          //         function (err, doc) {
          //           if (err) {
          //             console.log(err);
          //           } else {
          //             accountModel.findOneAndUpdate(
          //               { username: list[1] },
          //               { $pull: { transactions: { _id: tran._id } } },
          //               { safe: true, upsert: true },
          //               function (err, doc) {
          //                 if (err) {
          //                   console.log(err);
          //                 } else {
          //                   console.log(doc.transactions);
          //                   var data = {
          //                     ok: 1,
          //                   };
          //                   res.json(data);
          //                 }
          //               }
          //             );
          //           }
          //         }
          //       );
          //       break;
          //     case "thriftsavings":
          //       var finalValue =
          //         parseFloat(docs.thriftsavings) + parseFloat(amount);
          //       accountModel.findOneAndUpdate(
          //         { username: list[1] },
          //         { thriftsavings: finalValue.toFixed(2) },
          //         function (err, doc) {
          //           if (err) {
          //             console.log(err);
          //           } else {
          //             accountModel.findOneAndUpdate(
          //               { username: list[1] },
          //               { $pull: { transactions: { _id: tran._id } } },
          //               { safe: true, upsert: true },
          //               function (err, doc) {
          //                 if (err) {
          //                   console.log(err);
          //                 } else {
          //                   console.log(doc.transactions);
          //                   var data = {
          //                     ok: 1,
          //                   };
          //                   res.json(data);
          //                 }
          //               }
          //             );
          //           }
          //         }
          //       );

          //       break;
          //     case "specialdeposit":
          //       var finalValue =
          //         parseFloat(docs.specialdeposit) + parseFloat(amount);
          //       accountModel.findOneAndUpdate(
          //         { username: list[1] },
          //         { specialdeposit: finalValue.toFixed(2) },
          //         function (err, doc) {
          //           if (err) {
          //             console.log(err);
          //           } else {
          //             accountModel.findOneAndUpdate(
          //               { username: list[1] },
          //               { $pull: { transactions: { _id: tran._id } } },
          //               { safe: true, upsert: true },
          //               function (err, doc) {
          //                 if (err) {
          //                   console.log(err);
          //                 } else {
          //                   console.log(doc.transactions);
          //                   var data = {
          //                     ok: 1,
          //                   };
          //                   res.json(data);
          //                 }
          //               }
          //             );
          //           }
          //         }
          //       );
          //       break;

          //     case "commoditytrading":
          //       var finalValue =
          //         parseFloat(docs.commoditytrading) + parseFloat(amount);
          //       accountModel.findOneAndUpdate(
          //         { username: list[1] },
          //         { commoditytrading: finalValue.toFixed(2) },
          //         function (err, doc) {
          //           if (err) {
          //             console.log(err);
          //           } else {
          //             accountModel.findOneAndUpdate(
          //               { username: list[1] },
          //               { $pull: { transactions: { _id: tran._id } } },
          //               { safe: true, upsert: true },
          //               function (err, doc) {
          //                 if (err) {
          //                   console.log(err);
          //                 } else {
          //                   console.log(doc.transactions);
          //                   var data = {
          //                     ok: 1,
          //                   };
          //                   res.json(data);
          //                 }
          //               }
          //             );
          //           }
          //         }
          //       );
          //       break;

          //     case "fine":
          //       var finalValue = parseFloat(docs.fine) + parseFloat(amount);
          //       accountModel.findOneAndUpdate(
          //         { username: list[1] },
          //         { fine: finalValue.toFixed(2) },
          //         function (err, doc) {
          //           if (err) {
          //             console.log(err);
          //           } else {
          //             accountModel.findOneAndUpdate(
          //               { username: list[1] },
          //               { $pull: { transactions: { _id: tran._id } } },
          //               { safe: true, upsert: true },
          //               function (err, doc) {
          //                 if (err) {
          //                   console.log(err);
          //                 } else {
          //                   console.log(doc.transactions);
          //                   var data = {
          //                     ok: 1,
          //                   };
          //                   res.json(data);
          //                 }
          //               }
          //             );
          //           }
          //         }
          //       );
          //       break;

          //     case "loan":
          //       var finalValue = parseFloat(docs.loan) + parseFloat(amount);
          //       accountModel.findOneAndUpdate(
          //         { username: list[1] },
          //         { loan: finalValue.toFixed(2) },
          //         function (err, doc) {
          //           if (err) {
          //             console.log(err);
          //           } else {
          //             accountModel.findOneAndUpdate(
          //               { username: list[1] },
          //               { $pull: { transactions: { _id: tran._id } } },
          //               { safe: true, upsert: true },
          //               function (err, doc) {
          //                 if (err) {
          //                   console.log(err);
          //                 } else {
          //                   console.log(doc.transactions);
          //                   var data = {
          //                     ok: 1,
          //                   };
          //                   res.json(data);
          //                 }
          //               }
          //             );
          //           }
          //         }
          //       );
          //       break;

          //     case "projectfinancing":
          //       var finalValue =
          //         parseFloat(docs.projectfinancing) + parseFloat(amount);
          //       accountModel.findOneAndUpdate(
          //         { username: list[1] },
          //         { projectfinancing: finalValue.toFixed(2) },
          //         function (err, doc) {
          //           if (err) {
          //             console.log(err);
          //           } else {
          //             accountModel.findOneAndUpdate(
          //               { username: list[1] },
          //               { $pull: { transactions: { _id: tran._id } } },
          //               { safe: true, upsert: true },
          //               function (err, doc) {
          //                 if (err) {
          //                   console.log(err);
          //                 } else {
          //                   console.log(doc.transactions);
          //                   var data = {
          //                     ok: 1,
          //                   };
          //                   res.json(data);
          //                 }
          //               }
          //             );
          //           }
          //         }
          //       );
          //       break;
          //     default:
          //       break;
          //   }
          // }
          //  console.log(docs);
          //  console.log(tran.amount);
        }
      }
    });
  }
};

const editMemberDelete = function (req, res) {
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
};

module.exports = {
  editMemberGet: editMemberGet,
  editMemberPost: editMemberPost,
  editMemberDelete: editMemberDelete,
};
