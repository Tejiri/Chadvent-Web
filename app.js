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
app.listen(process.env.PORT ||3000);

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
  lasttransaction: String,
  loanapplicationstatus: String,
  phonenumber: String,
  email: String,
  address: String,
  gender: String,
  occupation: String,
  nextofkin: String,
  nextofkinaddress: String,
});

userShema.plugin(passportLocalMongoose);

const userModel = mongoose.model("users", userShema);
const memberModel = mongoose.model("members", memberSchema);
const accountModel = mongoose.model("accounts", accountSchema);

passport.use(userModel.createStrategy());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

var memberList = [];
contributionList = ["fdsdfds","dffdsfsd"];
var memberToEdit = "";
transaction = {};

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

function transactionToAdd(
  transactiontype,
  accounttype,
  amount,
  narration,
  date
) {
  transaction = {
    transactiontype: transactiontype,
    account: accounttype,
    amount: amount,
    narration: narration,
    date: date,
  };
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
              res.redirect("dashboard");
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
          contributionList =[];
          for (const key in docs) {
            memberList.push(docs[key]);
          }

          
          accountModel.find(function (err, docs) {
           
            for (const key in docs) {
              var totalcontribution =
                parseFloat(docs[key].sharecapital) +
                parseFloat(docs[key].thriftsavings) +
                parseFloat(docs[key].specialdeposit);
              contributionList.push(totalcontribution.toFixed(2));
              console.log(contributionList);
              
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
            lasttransaction: req.body.lasttransaction,
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

// Route to perform member update and credit/debit on accounts

app.route("/json/memberaccount").get(function (req, res) {
  accountModel.find(function (err, docs) {
    res.send(docs);
  });
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
            lasttransaction: doc.lasttransaction,
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
          lasttransaction: req.body.lasttransaction,
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
      if (req.body.creditselect == "sharecapital") {
        accountModel.findOne(
          {
            username: req.body.username,
          },
          function (err, doc) {
            if (err) {
              res.send(err);
            } else {
              var totalShareCapital =
                parseFloat(doc.sharecapital) +
                parseFloat(req.body.creditamount);

              transactionToAdd(
                "credit",
                "sharecapital",
                req.body.creditamount,
                req.body.creditdescription,
                req.body.creditdate
              );

              updateAccount(
                req.body.username,
                totalShareCapital.toFixed(2),
                doc.thriftsavings,
                doc.specialdeposit,
                doc.commoditytrading,
                doc.fine,
                doc.loan,
                doc.projectfinancing,
                transaction,
                res
              );
            }
          }
        );
      } else if (req.body.creditselect == "thriftsavings") {
        accountModel.findOne(
          {
            username: req.body.username,
          },
          function (err, doc) {
            if (err) {
              res.send(err);
            } else {
              var totalThriftSavings =
                parseFloat(doc.thriftsavings) +
                parseFloat(req.body.creditamount);

              transactionToAdd(
                "credit",
                "thriftsavings",
                req.body.creditamount,
                req.body.creditdescription,
                req.body.creditdate
              );

              updateAccount(
                req.body.username,
                doc.sharecapital,
                totalThriftSavings.toFixed(2),
                doc.specialdeposit,
                doc.commoditytrading,
                doc.fine,
                doc.loan,
                doc.projectfinancing,
                transaction,
                res
              );
            }
          }
        );
      } else if (req.body.creditselect == "specialdeposit") {
        accountModel.findOne(
          {
            username: req.body.username,
          },
          function (err, doc) {
            if (err) {
              res.send(err);
            } else {
              var totalSpecialDeposit =
                parseFloat(doc.specialdeposit) +
                parseFloat(req.body.creditamount);

              transactionToAdd(
                "credit",
                "specialdeposit",
                req.body.creditamount,
                req.body.creditdescription,
                req.body.creditdate
              );

              updateAccount(
                req.body.username,
                doc.sharecapital,
                doc.thriftsavings,
                totalSpecialDeposit.toFixed(2),
                doc.commoditytrading,
                doc.fine,
                doc.loan,
                doc.projectfinancing,
                transaction,
                res
              );
            }
          }
        );
      } else if (req.body.creditselect == "commoditytrading") {
        accountModel.findOne(
          {
            username: req.body.username,
          },
          function (err, doc) {
            if (err) {
              res.send(err);
            } else {
              var totalCommodityTrading =
                parseFloat(doc.commoditytrading) +
                parseFloat(req.body.creditamount);

              transactionToAdd(
                "credit",
                "commoditytrading",
                req.body.creditamount,
                req.body.creditdescription,
                req.body.creditdate
              );

              updateAccount(
                req.body.username,
                doc.sharecapital,
                doc.thriftsavings,
                doc.specialdeposit,
                totalCommodityTrading.toFixed(2),
                doc.fine,
                doc.loan,
                doc.projectfinancing,
                transaction,
                res
              );
            }
          }
        );
      } else if (req.body.creditselect == "fine") {
        accountModel.findOne(
          {
            username: req.body.username,
          },
          function (err, doc) {
            if (err) {
              res.send(err);
            } else {
              var totalFine =
                parseFloat(doc.fine) + parseFloat(req.body.creditamount);

              transactionToAdd(
                "credit",
                "fine",
                req.body.creditamount,
                req.body.creditdescription,
                req.body.creditdate
              );

              updateAccount(
                req.body.username,
                doc.sharecapital,
                doc.thriftsavings,
                doc.specialdeposit,
                doc.commoditytrading,
                totalFine.toFixed(2),
                doc.loan,
                doc.projectfinancing,
                transaction,
                res
              );
            }
          }
        );
      } else if (req.body.creditselect == "loan") {
        accountModel.findOne(
          {
            username: req.body.username,
          },
          function (err, doc) {
            if (err) {
              res.send(err);
            } else {
              var totalLoan =
                parseFloat(doc.loan) + parseFloat(req.body.creditamount);

              transactionToAdd(
                "credit",
                "loan",
                req.body.creditamount,
                req.body.creditdescription,
                req.body.creditdate
              );

              updateAccount(
                req.body.username,
                doc.sharecapital,
                doc.thriftsavings,
                doc.specialdeposit,
                doc.commoditytrading,
                doc.fine,
                totalLoan.toFixed(2),
                doc.projectfinancing,
                transaction,
                res
              );
            }
          }
        );
      } else if (req.body.creditselect == "projectfinancing") {
        accountModel.findOne(
          {
            username: req.body.username,
          },
          function (err, doc) {
            if (err) {
              res.send(err);
            } else {
              var totalProjectFinancing =
                parseFloat(doc.projectfinancing) +
                parseFloat(req.body.creditamount);

              transactionToAdd(
                "credit",
                "projectfinancing",
                req.body.creditamount,
                req.body.creditdescription,
                req.body.creditdate
              );

              updateAccount(
                req.body.username,
                doc.sharecapital,
                doc.thriftsavings,
                doc.specialdeposit,
                doc.commoditytrading,
                doc.fine,
                doc.loan,
                totalProjectFinancing.toFixed(2),
                transaction,
                res
              );
            }
          }
        );
      }
    } else if (req.body.updatebutton === "Debit Member Account") {
      if (req.body.debitselect == "sharecapital") {
        accountModel.findOne(
          {
            username: req.body.username,
          },
          function (err, doc) {
            if (err) {
              res.send(err);
            } else {
              var totalShareCapital =
                parseFloat(doc.sharecapital) - parseFloat(req.body.debitamount);

              transactionToAdd(
                "Debit",
                "sharecapital",
                req.body.debitamount,
                req.body.debitdescription,
                req.body.debitdate
              );

              updateAccount(
                req.body.username,
                totalShareCapital.toFixed(2),
                doc.thriftsavings,
                doc.specialdeposit,
                doc.commoditytrading,
                doc.fine,
                doc.loan,
                doc.projectfinancing,
                transaction,
                res
              );
            }
          }
        );
      } else if (req.body.debitselect == "thriftsavings") {
        accountModel.findOne(
          {
            username: req.body.username,
          },
          function (err, doc) {
            if (err) {
              res.send(err);
            } else {
              var totalThriftSavings =
                parseFloat(doc.thriftsavings) -
                parseFloat(req.body.debitamount);

              transactionToAdd(
                "Debit",
                "thriftsavings",
                req.body.debitamount,
                req.body.debitdescription,
                req.body.debitdate
              );

              updateAccount(
                req.body.username,
                doc.sharecapital,
                totalThriftSavings.toFixed(2),
                doc.specialdeposit,
                doc.commoditytrading,
                doc.fine,
                doc.loan,
                doc.projectfinancing,
                transaction,
                res
              );
            }
          }
        );
      } else if (req.body.debitselect == "specialdeposit") {
        accountModel.findOne(
          {
            username: req.body.username,
          },
          function (err, doc) {
            if (err) {
              res.send(err);
            } else {
              var totalSpecialDeposit =
                parseFloat(doc.specialdeposit) -
                parseFloat(req.body.debitamount);

              transactionToAdd(
                "Debit",
                "specialdeposit",
                req.body.debitamount,
                req.body.debitdescription,
                req.body.debitdate
              );

              updateAccount(
                req.body.username,
                doc.sharecapital,
                doc.thriftsavings,
                totalSpecialDeposit.toFixed(2),
                doc.commoditytrading,
                doc.fine,
                doc.loan,
                doc.projectfinancing,
                transaction,
                res
              );
            }
          }
        );
      } else if (req.body.debitselect == "commoditytrading") {
        accountModel.findOne(
          {
            username: req.body.username,
          },
          function (err, doc) {
            if (err) {
              res.send(err);
            } else {
              var totalCommodityTrading =
                parseFloat(doc.commoditytrading) -
                parseFloat(req.body.debitamount);

              transactionToAdd(
                "Debit",
                "commoditytrading",
                req.body.debitamount,
                req.body.debitdescription,
                req.body.debitdate
              );

              updateAccount(
                req.body.username,
                doc.sharecapital,
                doc.thriftsavings,
                doc.specialdeposit,
                totalCommodityTrading.toFixed(2),
                doc.fine,
                doc.loan,
                doc.projectfinancing,
                transaction,
                res
              );
            }
          }
        );
      } else if (req.body.debitselect == "fine") {
        accountModel.findOne(
          {
            username: req.body.username,
          },
          function (err, doc) {
            if (err) {
              res.send(err);
            } else {
              var totalFine =
                parseFloat(doc.fine) - parseFloat(req.body.debitamount);

              transactionToAdd(
                "Debit",
                "fine",
                req.body.debitamount,
                req.body.debitdescription,
                req.body.debitdate
              );

              updateAccount(
                req.body.username,
                doc.sharecapital,
                doc.thriftsavings,
                doc.specialdeposit,
                doc.commoditytrading,
                totalFine.toFixed(2),
                doc.loan,
                doc.projectfinancing,
                transaction,
                res
              );
            }
          }
        );
      } else if (req.body.debitselect == "loan") {
        accountModel.findOne(
          {
            username: req.body.username,
          },
          function (err, doc) {
            if (err) {
              res.send(err);
            } else {
              var totalLoan =
                parseFloat(doc.loan) - parseFloat(req.body.debitamount);

              transactionToAdd(
                "Debit",
                "loan",
                req.body.debitamount,
                req.body.debitdescription,
                req.body.debitdate
              );

              updateAccount(
                req.body.username,
                doc.sharecapital,
                doc.thriftsavings,
                doc.specialdeposit,
                doc.commoditytrading,
                doc.fine,
                totalLoan.toFixed(2),
                doc.projectfinancing,
                transaction,
                res
              );
            }
          }
        );
      } else if (req.body.debitselect == "projectfinancing") {
        accountModel.findOne(
          {
            username: req.body.username,
          },
          function (err, doc) {
            if (err) {
              res.send(err);
            } else {
              var totalProjectFinancing =
                parseFloat(doc.projectfinancing) -
                parseFloat(req.body.debitamount);

              transactionToAdd(
                "Debit",
                "projectfinancing",
                req.body.debitamount,
                req.body.debitdescription,
                req.body.debitdate
              );

              updateAccount(
                req.body.username,
                doc.sharecapital,
                doc.thriftsavings,
                doc.specialdeposit,
                doc.commoditytrading,
                doc.fine,
                doc.loan,
                totalProjectFinancing.toFixed(2),
                transaction,
                res
              );
            }
          }
        );
      }
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
