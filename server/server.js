// server.js
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const mime = require('mime-types');
const validator = require('validator');
const sanitizeHtml = require('sanitize-html');
const fs = require('fs');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();
// import cookieParser from 'cookie-parser';

const app = express();
const port = process.env.DB_PORT || 3001;
app.use(express.json());
app.use(cookieParser());

app.use(bodyParser.json());
app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ['POST', 'GET'],
    credentials: true
}));

// Helper function to sanitize and validate input
// this is the validator and sanitizer of the input of the user
const sanitizeAndValidate = (input, validationRules) => {

    // clean multiple spaces
    const cleanedInput = input.replace(/\s+/g, ' ');

    const sanitizedInput = sanitizeHtml(cleanedInput.trim());

    for (const rule of validationRules) {
        if (!rule.validator(sanitizedInput)) {
            return false;
        }
    }

    return sanitizedInput;
};

// my secret key
const secretKey = '7044bb999e1788e1a373de730d5295488402e301e2fc0f790f3602297b9143fe';

// require uploads folder
app.use('/uploads', express.static('uploads'));

// MySQL configuration
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

// #####################################################################    CURRENT DATE FORMAT  ######################################################################################
function getCurrentFormattedDate() {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    };

    const currentDate = new Date();
    return new Intl.DateTimeFormat('en-US', options).format(currentDate);
}

// #####################################################################    VERIFY TOKEN SIDE  ######################################################################################
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token missing or invalid' });
    } else {
        const token = authHeader.substring('Bearer '.length);

        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Token is expired or invalid' });
            }

            // Store decoded user data in the request
            req.user = decoded;
            next();
        });
    }
};

// #####################################################################    LOGIN SIDE  ######################################################################################
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const isDelete = "not";

    const validationRules = [
        { validator: validator.isLength, options: { min: 1, max: 50 } },
        // {validator: validator.isEmail, options: {min: 1, max: 50}}
    ]

    const sanitizeEmail = sanitizeAndValidate(email, validationRules);
    const sanitizePassword = sanitizeAndValidate(password, validationRules);

    if (!sanitizeEmail || !sanitizePassword) {
        res.status(401).json({ message: "Invalid Input!" });
    }

    else {
        const hashedPassword = crypto.createHash('sha256').update(sanitizePassword).digest('hex');
        const query = `SELECT * FROM users WHERE email = '${sanitizeEmail}' AND password = '${hashedPassword}' AND isDelete = '${isDelete}'`;

        connection.query(query, (err, results) => {
            if (err) throw err;

            if (results.length > 0) {

                // fetch id and email
                const fetchData = {
                    id: results[0].id,
                    email: results[0].email,
                    password: results[0].password,
                    rank: results[0].rank
                };

                // const token = jwt.sign(fetchData, secretKey, { expiresIn: '1h' });
                const token = jwt.sign(fetchData, secretKey);

                // res.cookie(token);
                res.status(200).json({ token: token, rank: results[0].rank });
                // res.status(200).json({results});
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        });
    }
});

// #####################################################################    FETCH DATA USING ID  ######################################################################################
app.get('/api/getData/:id', verifyToken, (req, res) => {
    const id = req.params.id;

    const query = `SELECT * FROM users WHERE id = '${id}'`;

    connection.query(query, (error, results) => {

        if (error) {
            console.log("Error: ", error);
            // res.status(500).json({ message: 'Error fetching data' });
        } else {
            res.status(200).json({ results });
        }
    });
});

// #####################################################################  PROTECTED SIDE  ######################################################################################
app.get('/protected', verifyToken, (req, res) => {
    const { user } = req; // Decoded user data from the token

    res.status(200).json({ message: 'Success', user: user });
});

// ##########################################################################        ADMIN SIDE           ##################################################################################################
// #####################################################################    REGISTER UNIT HEAD ACCOUNT ADDED BY ADMIN  ######################################################################################
app.post('/add-unit-head', verifyToken, (req, res) => {

    const { RorE, campus, fullname, email, generatedPassword, user_id } = req.body;
    const givenImage = "givenProfile.png";
    const addedBy = "Admin";
    const givenRank = "Unit Head";

    // get the current date
    const currentDate = getCurrentFormattedDate();

    const validationRules = [
        { validator: validator.isLength, options: { min: 1, max: 50 } },
    ]

    const sanitizeRorE = sanitizeAndValidate(RorE, validationRules);
    const sanitizeCampus = sanitizeAndValidate(campus, validationRules);
    const sanitizeFullname = sanitizeAndValidate(fullname, validationRules);
    const sanitizeEmail = sanitizeAndValidate(email, validationRules);
    const sanitizePassword = sanitizeAndValidate(generatedPassword, validationRules);
    const sanitizeUserId = sanitizeAndValidate(user_id, validationRules);

    if (!sanitizeRorE || !sanitizeCampus || !sanitizeFullname || !sanitizeEmail || !sanitizePassword || !sanitizeUserId) {
        res.status(401).json({ message: "Invalid Input!" });
    }
    else {
        // check if email is already in used
        const checkEmail = 'SELECT * FROM users WHERE email = ? AND rank = ? AND isDelete = ?';
        connection.query(checkEmail, [sanitizeEmail, givenRank, "not"], (error, results) => {
            if (error) {
                res.status(401).json({ message: 'Server side error!' });
            }
            else {
                if (results.length === 0) {
                    // create password hash
                    const passwordHash = crypto.createHash('sha256').update(sanitizePassword).digest('hex');

                    // Insert image path into MySQL database
                    const sql = 'INSERT INTO users (RorE, campus, fullname, email, password, image, added_by, rank, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
                    connection.query(sql, [sanitizeRorE, sanitizeCampus, sanitizeFullname, sanitizeEmail, passwordHash, givenImage, addedBy, givenRank, currentDate], (err, result) => {
                        if (err) {
                            console.error('Error inserting data into MySQL:', err);
                            res.status(401).json({ message: 'Error uploading data to the server.' });
                        } else {
                            // get the inserted id
                            const receiverId = result.insertId;

                            // send notification for sender
                            const senderContent = `You added ${sanitizeFullname} as Unit Head from ${sanitizeCampus} campus`;
                            const receiverContent = "Admin added your account";

                            // insert sender notification
                            const senderData = 'INSERT INTO notification (user_id, content, date) VALUES (?, ?, ?)';
                            connection.query(senderData, [sanitizeUserId, senderContent, currentDate], (error, results) => {
                                if (error) {
                                    res.status(401).json({ message: "Server side error!" });
                                } else {
                                    // insert receiver notification
                                    const receiverData = 'INSERT INTO notification (user_id, content, date) VALUES (?, ?, ?)';
                                    connection.query(receiverData, [receiverId, receiverContent, currentDate], (error, results) => {
                                        if (error) {
                                            res.status(401).json({ message: "Server side error" });
                                        } else {
                                            // send verification code to email
                                            const body = `Hi ${sanitizeFullname} You can now access to JRMSU Research Development And Extension Portal from ${sanitizeRorE.toUpperCase()} in ${sanitizeCampus.toUpperCase()} as ${givenRank.toUpperCase()} using this Email: ${sanitizeEmail.toUpperCase()} and Password: ${sanitizePassword} \n\n. Click here to login (sample link here!)`;

                                            var transporter = nodemailer.createTransport({
                                                service: 'gmail',
                                                auth: {
                                                    user: 'jrmsuvpred@gmail.com',
                                                    pass: 'kbwyyjspjdjerrno'
                                                }
                                            });

                                            var mailOptions = {
                                                from: 'jrmsuvpred@gmail.com',
                                                to: sanitizeEmail,
                                                subject: 'Your verification code!',
                                                text: body
                                            };

                                            transporter.sendMail(mailOptions, function (error, info) {
                                                if (error) {
                                                    console.log(error);
                                                } else {
                                                    res.status(200).json({ message: 'Account has been successfully added and was sent to email successfully!' });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
                else {
                    res.status(401).json({ message: 'Email is already in used! Please try again!' });
                }
            }
        });
    }
});

// #####################################################################    FETCH ALL UNIT HEAD ACCOUNT  ######################################################################################
app.get('/fetch/all-unit-head', verifyToken, (req, res) => {
    // fetch data
    const unitData = 'SELECT * FROM users WHERE rank = ? AND isDelete = ?';
    connection.query(unitData, ["Unit Head", "not"], (error, results) => {
        if (error) {
            res.status(401).json({ message: 'Server side error!' });
        }
        else {
            if (results.length > 0) {
                //success
                res.status(200).json({ results });
            }
            else {
                res.status(401).json({ message: "Something went wrong!" });
            }
        }
    });
});

// #####################################################################    UPDATE UNIT HEAD  ######################################################################################
app.post('/update/unit-head', verifyToken, (req, res) => {
    const { updateIdString, updateRorEString, updateCampusString, updateFullnameString, updateEmailString, updateCurrentEmailString, user_id } = req.body;
    // get current date
    const currentDate = getCurrentFormattedDate();

    const validationRules = [
        { validator: validator.isLength, options: { min: 1, max: 50 } },
    ]

    const sanitizeUpdateId = sanitizeAndValidate(updateIdString, validationRules);
    const sanitizeUpdateRorE = sanitizeAndValidate(updateRorEString, validationRules);
    const sanitizeUpdateCampus = sanitizeAndValidate(updateCampusString, validationRules);
    const sanitizeUpdateFullname = sanitizeAndValidate(updateFullnameString, validationRules);
    const sanitizeUpdateEmail = sanitizeAndValidate(updateEmailString, validationRules);
    const sanitizeCurrentEmail = sanitizeAndValidate(updateCurrentEmailString, validationRules);
    const sanitizeUserId = sanitizeAndValidate(user_id, validationRules);

    if (!sanitizeUpdateId || !sanitizeUpdateRorE || !sanitizeUpdateCampus || !sanitizeUpdateFullname || !sanitizeUpdateEmail || !sanitizeCurrentEmail || !sanitizeUserId) {
        res.status(401).json({ message: "Invalid Input!" });
    } else {
        const checkEmail = 'SELECT * FROM users WHERE email = ? AND id != ? AND rank = ? AND isDelete = ?';
        connection.query(checkEmail, [sanitizeUpdateEmail, sanitizeUpdateId, "Unit Head", "not"], (error, results) => {
            if (error) {
                res.status(401).json({ message: "Server side error!" });
            } else {
                if (results.length > 0) {
                    res.status(401).json({ message: "Email is already in used! Please try again!" });
                }
                else {
                    const updateData = 'UPDATE users SET RorE = ?, campus = ?, fullname = ?, email = ? WHERE id = ?';
                    connection.query(updateData, [sanitizeUpdateRorE, sanitizeUpdateCampus, sanitizeUpdateFullname, sanitizeUpdateEmail, sanitizeUpdateId], (error, results) => {
                        if (error) {
                            res.status(401).json({ message: "Server side error!" });
                        } else {
                            if (results.length > 0) {
                                res.status(401).json({ message: "Something went wrong!" });
                            } else {
                                // send notification
                                const receiverContent = `Admin updated your accout!`;

                                // insert notification to database
                                const receiverData = 'INSERT INTO notification (user_id, content, date) VALUES (?, ?, ?)';
                                connection.query(receiverData, [sanitizeUpdateId, receiverContent, currentDate], (error, results) => {
                                    if (error) {
                                        res.status(401).json({ message: "Server side error" });
                                    } else {
                                        // initialize test
                                        let test;

                                        // check the current email and updated email
                                        if (sanitizeCurrentEmail === sanitizeUpdateEmail) {
                                            test = true;
                                        } else {
                                            test = false;
                                        }

                                        const body = `Your account on jrmsu vpred as Unit Head was updated to ${sanitizeUpdateRorE.toUpperCase()}, Campus: ${sanitizeUpdateCampus.toUpperCase()}, Name: ${sanitizeUpdateFullname.toUpperCase()} and Email: ${sanitizeUpdateEmail.toUpperCase()}`;

                                        var transporter = nodemailer.createTransport({
                                            service: 'gmail',
                                            auth: {
                                                user: 'jrmsuvpred@gmail.com',
                                                pass: 'kbwyyjspjdjerrno'
                                            }
                                        });

                                        var mailOptions = {
                                            from: 'jrmsuvpred@gmail.com',
                                            to: sanitizeCurrentEmail,
                                            subject: 'Account update status!',
                                            text: body
                                        };

                                        if (test) {
                                            transporter.sendMail(mailOptions, function (error, info) {
                                                if (error) {
                                                    console.log(error);
                                                } else {
                                                    res.status(200).json({ message: 'Account has been successfully Updated and was sent to email successfully!' });
                                                }
                                            });
                                        } else {
                                            transporter.sendMail(mailOptions, function (error, info) {
                                                if (error) {
                                                    console.log(error);
                                                } else {

                                                    const newBody = `Your account on jrmsu vpred as Unit Head was updated to this Email: ${sanitizeUpdateEmail.toUpperCase()}. \n\nvisit for more on this link: (sample link)`;

                                                    var newMailOption = {
                                                        from: 'jrmsuvpred@gmail.com',
                                                        to: sanitizeUpdateEmail,
                                                        subject: 'Your verification code!',
                                                        text: newBody
                                                    };

                                                    transporter.sendMail(newMailOption, function (error, info) {
                                                        if (error) {
                                                            console.log(error);
                                                        } else {
                                                            res.status(200).json({ message: 'Account has been successfully Updated and was sent to email successfully!' });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    }
                                })
                            }
                        }
                    });
                }
            }
        });
    }
});

// #####################################################################    DELETE UNIT HEAD ACCOUNT  ######################################################################################
app.post('/delete/unit-head', verifyToken, (req, res) => {
    const { deleteIdString, deleteEmailString } = req.body;

    const validationRules = [
        { validator: validator.isLength, options: { min: 1, max: 50 } }
    ]

    const sanitizeDelete = sanitizeAndValidate(deleteIdString, validationRules);
    const sanitizeDeleteEmail = sanitizeAndValidate(deleteEmailString, validationRules);

    if (!sanitizeDelete || !sanitizeDeleteEmail) {
        res.status(401).json({ message: "Invalid Input!" });
    } else {
        // delete
        const deleteId = 'UPDATE users SET isDelete = ? WHERE id = ?';
        connection.query(deleteId, ["Deleted", sanitizeDelete], (error, results) => {
            if (error) {
                res.status(401).json({ message: "Server side error!" });
            } else {
                // send to email
                const body = `Your account on jrmsu vpred as Unit Head was been deleted by Admin. You can't no longer access on the portal`;

                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'jrmsuvpred@gmail.com',
                        pass: 'kbwyyjspjdjerrno'
                    }
                });

                var mailOptions = {
                    from: 'jrmsuvpred@gmail.com',
                    to: sanitizeDeleteEmail,
                    subject: 'Your account was deleted!',
                    text: body
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        res.status(200).json({ message: "Account has been deleted uccessfully!" });
                    }
                });
            }
        });
    }
});

// #####################################################################    ADD CHAIRPERSON ACCOUNT  ######################################################################################
app.post('/add-chairperson', verifyToken, (req, res) => {
    const { RorE, campus, college, fullname, email, password, user_id } = req.body;
    const addedBy = "Admin";
    const givenImage = "givenProfile.png";

    // fetch current date
    const currentDate = getCurrentFormattedDate();

    const validationRules = [
        { validator: validator.isLength, options: { min: 1, max: 50 } }
    ];

    const validatedRorE = sanitizeAndValidate(RorE, validationRules);
    const validatedCampus = sanitizeAndValidate(campus, validationRules);
    const validatedCollege = sanitizeAndValidate(college, validationRules);
    const validatedFullname = sanitizeAndValidate(fullname, validationRules);
    const validatedEmail = sanitizeAndValidate(email, validationRules);
    const validatedPassword = sanitizeAndValidate(password, validationRules);
    const sanitizeUserId = sanitizeAndValidate(user_id, validationRules);

    if (!validatedRorE || !validatedCampus || !validatedCollege || !validatedFullname || !validatedEmail || !validatedPassword || !sanitizeUserId) {
        res.status(401).json({ message: "Invalid Input!" });
    }
    else {
        const cCheckEmail = 'SELECT * FROM users WHERE email = ? AND rank = ? AND isDelete = ?';
        connection.query(cCheckEmail, [validatedEmail, "Chairperson", "not"], (error, results) => {
            if (error) {
                res.status(401).json({ message: "Server side error!" });
            }
            else {
                if (results.length === 0) {
                    // success
                    // hash password
                    const hashedPassword = crypto.createHash('sha256').update(validatedPassword).digest('hex');
                    const insert = 'INSERT INTO users (RorE, campus, college, fullname, email, password, added_by, image, date, rank) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                    connection.query(insert, [validatedRorE, validatedCampus, validatedCollege, validatedFullname, validatedEmail, hashedPassword, addedBy, givenImage, currentDate, "Chairperson"], (error, results) => {
                        if (error) {
                            res.status(401).json({ message: "Server side error!" });
                        }
                        else {
                            // get inserted id
                            const receiverId = results.insertId;

                            // initialize sender and receiver content
                            const senderContent = `You added ${validatedFullname} as Chairperson at ${validatedCampus} campus college of ${validatedCollege}`;
                            const receiverContent = `Admin added your account`;

                            // insert into database
                            const senderData = 'INSERT INTO notification (user_id, content, date) VALUES (?, ?, ?)';
                            connection.query(senderData, [sanitizeUserId, senderContent, currentDate], (error, results) => {
                                if (error) {
                                    res.status(401).json({ message: "Server side error" });
                                } else {
                                    // insert reciever notification
                                    const receiverData = 'INSERT INTO notification (user_id, content, date) VALUES (?, ?, ?)';
                                    connection.query(receiverData, [receiverId, receiverContent, currentDate], (error, results) => {
                                        if (error) {
                                            res.status(401).json({ message: "Server side error!" });
                                        } else {
                                            // send to email
                                            const body = `Hi ${validatedFullname} you can now access to JRMSU Research Development And Extension Portal from ${validatedRorE.toUpperCase()} in ${validatedCampus.toUpperCase()} as CHAIRPERSON in ${validatedCollege} using this Email: ${validatedEmail.toUpperCase()} and Password: ${validatedPassword} \n\n. Click here to login (sample link here!)`;

                                            var transporter = nodemailer.createTransport({
                                                service: 'gmail',
                                                auth: {
                                                    user: 'jrmsuvpred@gmail.com',
                                                    pass: 'kbwyyjspjdjerrno'
                                                }
                                            });

                                            var mailOptions = {
                                                from: 'jrmsuvpred@gmail.com',
                                                to: validatedEmail,
                                                subject: 'Your verification code!',
                                                text: body
                                            };

                                            transporter.sendMail(mailOptions, function (error, info) {
                                                if (error) {
                                                    console.log(error);
                                                } else {
                                                    res.status(200).json({ message: 'Account has been successfully added and was sent to email successfully!' });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
                else {
                    res.status(401).json({ message: "Email is already in used! Please try again!" });
                }
            }
        });
    }
})

// #####################################################################    FETCH ALL CHAIRPERSON ACCOUNT  ######################################################################################
app.get('/fetch/all-chairperson', verifyToken, (req, res) => {
    // fetch data
    const unitData = 'SELECT * FROM users WHERE rank = ? AND isDelete = ?';
    connection.query(unitData, ["Chairperson", "not"], (error, results) => {
        if (error) {
            res.status(401).json({ message: 'Server side error!' });
        }
        else {
            if (results.length > 0) {
                //success
                res.status(200).json({ results });
            }
            else {
                res.status(401).json({ message: "Something went wrong!" });
            }
        }
    });
});

// #####################################################################    UPDATE CHAIRPERSON ACCOUNT  ######################################################################################
app.post('/update/chairperson', verifyToken, (req, res) => {
    const { updateIdString, updateRorEString, updateCampusString, updateFullnameString, updateEmailString, updateCurrentEmailString, updateCollegeString } = req.body;
    // get current date
    const currentDate = getCurrentFormattedDate();

    const validationRules = [
        { validator: validator.isLength, options: { min: 1, max: 50 } },
    ]

    const sanitizeUpdateId = sanitizeAndValidate(updateIdString, validationRules);
    const sanitizeUpdateRorE = sanitizeAndValidate(updateRorEString, validationRules);
    const sanitizeUpdateCampus = sanitizeAndValidate(updateCampusString, validationRules);
    const sanitizeUpdateFullname = sanitizeAndValidate(updateFullnameString, validationRules);
    const sanitizeUpdateEmail = sanitizeAndValidate(updateEmailString, validationRules);
    const sanitizeCurrentEmail = sanitizeAndValidate(updateCurrentEmailString, validationRules);
    const sanitizeCollege = sanitizeAndValidate(updateCollegeString, validationRules);

    if (!sanitizeUpdateId || !sanitizeUpdateRorE || !sanitizeUpdateCampus || !sanitizeUpdateFullname || !sanitizeUpdateEmail || !sanitizeCurrentEmail || !sanitizeCollege) {
        res.status(401).json({ message: "Invalid Input!" });
    } else {
        const checkEmail = 'SELECT * FROM users WHERE email = ? AND id != ? AND rank = ? AND isDelete = ?';
        connection.query(checkEmail, [sanitizeUpdateEmail, sanitizeUpdateId, "Chairperson", "not"], (error, results) => {
            if (error) {
                res.status(401).json({ message: "Server side error!" });
            } else {
                if (results.length > 0) {
                    res.status(401).json({ message: "Email is already in used! Please try again!" });
                }
                else {
                    const updateData = 'UPDATE users SET RorE = ?, campus = ?, fullname = ?, email = ?, college = ? WHERE id = ?';
                    connection.query(updateData, [sanitizeUpdateRorE, sanitizeUpdateCampus, sanitizeUpdateFullname, sanitizeUpdateEmail, sanitizeCollege, sanitizeUpdateId], (error, results) => {
                        if (error) {
                            res.status(401).json({ message: "Server side error!" });
                        } else {
                            if (results.length > 0) {
                                res.status(401).json({ message: "Something went wrong!" });
                            } else {
                                // initialize receiver content
                                const receiverContent = `Admin updated your account`;

                                // insert notification to database
                                const receiverData = 'INSERT INTO notification (user_id, content, date) VALUES (?, ? ,?)';
                                connection.query(receiverData, [sanitizeUpdateId, receiverContent, currentDate], (error, results) => {
                                    if (error) {
                                        res.status(401).json({ message: "Server side error" });
                                    } else {
                                        let test;

                                        // check the current email and updated email
                                        if (sanitizeCurrentEmail === sanitizeUpdateEmail) {
                                            test = true;
                                        } else {
                                            test = false;
                                        }

                                        const body = `Your account on jrmsu vpred as Chairperson was updated to ${sanitizeUpdateRorE.toUpperCase()}, Campus: ${sanitizeUpdateCampus.toUpperCase()}, Name: ${sanitizeUpdateFullname.toUpperCase()} and Email: ${sanitizeUpdateEmail.toUpperCase()}`;

                                        var transporter = nodemailer.createTransport({
                                            service: 'gmail',
                                            auth: {
                                                user: 'jrmsuvpred@gmail.com',
                                                pass: 'kbwyyjspjdjerrno'
                                            }
                                        });

                                        var mailOptions = {
                                            from: 'jrmsuvpred@gmail.com',
                                            to: sanitizeCurrentEmail,
                                            subject: 'Account update status!',
                                            text: body
                                        };

                                        if (test) {
                                            transporter.sendMail(mailOptions, function (error, info) {
                                                if (error) {
                                                    console.log(error);
                                                } else {
                                                    res.status(200).json({ message: 'Account has been successfully Updated and was sent to email successfully!' });
                                                }
                                            });
                                        } else {
                                            transporter.sendMail(mailOptions, function (error, info) {
                                                if (error) {
                                                    console.log(error);
                                                } else {

                                                    const newBody = `Your account on jrmsu vpred as Chairperson was updated to this Email: ${sanitizeUpdateEmail.toUpperCase()}. \n\nvisit for more on this link: (sample link)`;

                                                    var newMailOption = {
                                                        from: 'jrmsuvpred@gmail.com',
                                                        to: sanitizeUpdateEmail,
                                                        subject: 'Your verification code!',
                                                        text: newBody
                                                    };

                                                    transporter.sendMail(newMailOption, function (error, info) {
                                                        if (error) {
                                                            console.log(error);
                                                        } else {
                                                            res.status(200).json({ message: 'Account has been successfully Updated and was sent to email successfully!' });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    }
});

// #####################################################################    DELETE CHAIRPERSON ACCOUNT  ######################################################################################
app.post('/delete/chairperson', verifyToken, (req, res) => {
    const { deleteIdString, deleteEmailString } = req.body;

    const validationRules = [
        { validator: validator.isLength, options: { min: 1, max: 50 } }
    ]

    const sanitizeDelete = sanitizeAndValidate(deleteIdString, validationRules);
    const sanitizeDeleteEmail = sanitizeAndValidate(deleteEmailString, validationRules);

    if (!sanitizeDelete || !sanitizeDeleteEmail) {
        res.status(401).json({ message: "Invalid Input!" });
    } else {
        // delete
        const deleteId = 'UPDATE users SET isDelete = ? WHERE id = ?';
        connection.query(deleteId, ["Deleted", sanitizeDelete], (error, results) => {
            if (error) {
                res.status(401).json({ message: "Server side error!" });
            } else {
                // send to email
                const body = `Your account on jrmsu vpred as Chairperson was been deleted by Admin. You can't no longer access on the portal`;

                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'jrmsuvpred@gmail.com',
                        pass: 'kbwyyjspjdjerrno'
                    }
                });

                var mailOptions = {
                    from: 'jrmsuvpred@gmail.com',
                    to: sanitizeDeleteEmail,
                    subject: 'Your account was deleted!',
                    text: body
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        res.status(200).json({ message: "Account has been deleted uccessfully!" });
                    }
                });
            }
        });
    }
});

// #####################################################################    FETCH ALL AUTHOR ACCOUNT  ######################################################################################
app.get('/fetch/all-author', verifyToken, (req, res) => {
    // fetch data
    const unitData = 'SELECT * FROM users WHERE rank = ? AND isDelete = ?';
    connection.query(unitData, ["Author", "not"], (error, results) => {
        if (error) {
            res.status(401).json({ message: 'Server side error!' });
        }
        else {
            if (results.length > 0) {
                //success
                res.status(200).json({ results });
            }
            else {
                res.status(401).json({ message: "Something went wrong!" });
            }
        }
    });
});

// #####################################################################    UPDATE CHAIRPERSON ACCOUNT  ######################################################################################
app.post('/update/author', verifyToken, (req, res) => {
    const { updateIdString, updateRorEString, updateCampusString, updateFullnameString, updateEmailString, updateCurrentEmailString, updateCollegeString } = req.body;
    // get current date
    const currentDate = getCurrentFormattedDate();

    const validationRules = [
        { validator: validator.isLength, options: { min: 1, max: 50 } },
    ]

    const sanitizeUpdateId = sanitizeAndValidate(updateIdString, validationRules);
    const sanitizeUpdateRorE = sanitizeAndValidate(updateRorEString, validationRules);
    const sanitizeUpdateCampus = sanitizeAndValidate(updateCampusString, validationRules);
    const sanitizeUpdateFullname = sanitizeAndValidate(updateFullnameString, validationRules);
    const sanitizeUpdateEmail = sanitizeAndValidate(updateEmailString, validationRules);
    const sanitizeCurrentEmail = sanitizeAndValidate(updateCurrentEmailString, validationRules);
    const sanitizeCollege = sanitizeAndValidate(updateCollegeString, validationRules);

    if (!sanitizeUpdateId || !sanitizeUpdateRorE || !sanitizeUpdateCampus || !sanitizeUpdateFullname || !sanitizeUpdateEmail || !sanitizeCurrentEmail || !sanitizeCollege) {
        res.status(401).json({ message: "Invalid Input!" });
    } else {
        const updateData = 'UPDATE users SET RorE = ?, campus = ?, fullname = ?, email = ?, college = ? WHERE id = ?';
        connection.query(updateData, [sanitizeUpdateRorE, sanitizeUpdateCampus, sanitizeUpdateFullname, sanitizeUpdateEmail, sanitizeCollege, sanitizeUpdateId], (error, results) => {
            if (error) {
                res.status(401).json({ message: "Server side error!" });
            } else {
                if (results.length > 0) {
                    res.status(401).json({ message: "Something went wrong!" });
                } else {
                    // initialize receiver content
                    const receiverContent = `Admin updated your account`;

                    // insert notification to database
                    const receiverData = 'INSERT INTO notification (user_id, content, date) VALUES (?, ? ,?)';
                    connection.query(receiverData, [sanitizeUpdateId, receiverContent, currentDate], (error, results) => {
                        if (error) {
                            res.status(401).json({ message: "Server side error" });
                        } else {
                            let test;

                            // check the current email and updated email
                            if (sanitizeCurrentEmail === sanitizeUpdateEmail) {
                                test = true;
                            } else {
                                test = false;
                            }

                            const body = `Your account on jrmsu vpred as Author was updated to ${sanitizeUpdateRorE.toUpperCase()}, Campus: ${sanitizeUpdateCampus.toUpperCase()}, Name: ${sanitizeUpdateFullname.toUpperCase()} and Email: ${sanitizeUpdateEmail.toUpperCase()}`;

                            var transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    user: 'jrmsuvpred@gmail.com',
                                    pass: 'kbwyyjspjdjerrno'
                                }
                            });

                            var mailOptions = {
                                from: 'jrmsuvpred@gmail.com',
                                to: sanitizeCurrentEmail,
                                subject: 'Account update status!',
                                text: body
                            };

                            if (test) {
                                transporter.sendMail(mailOptions, function (error, info) {
                                    if (error) {
                                        console.log(error);
                                    } else {
                                        res.status(200).json({ message: 'Account has been successfully Updated and was sent to email successfully!' });
                                    }
                                });
                            } else {
                                transporter.sendMail(mailOptions, function (error, info) {
                                    if (error) {
                                        console.log(error);
                                    } else {

                                        const newBody = `Your account on jrmsu vpred as Author was updated to this Email: ${sanitizeUpdateEmail.toUpperCase()}. \n\nvisit for more on this link: (sample link)`;

                                        var newMailOption = {
                                            from: 'jrmsuvpred@gmail.com',
                                            to: sanitizeUpdateEmail,
                                            subject: 'Your verification code!',
                                            text: newBody
                                        };

                                        transporter.sendMail(newMailOption, function (error, info) {
                                            if (error) {
                                                console.log(error);
                                            } else {
                                                res.status(200).json({ message: 'Account has been successfully Updated and was sent to email successfully!' });
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    }
});

// #####################################################################    DELETE CHAIRPERSON ACCOUNT  ######################################################################################
app.post('/delete/author', verifyToken, (req, res) => {
    const { deleteIdString, deleteEmailString } = req.body;

    const validationRules = [
        { validator: validator.isLength, options: { min: 1, max: 50 } }
    ]

    const sanitizeDelete = sanitizeAndValidate(deleteIdString, validationRules);
    const sanitizeDeleteEmail = sanitizeAndValidate(deleteEmailString, validationRules);

    if (!sanitizeDelete || !sanitizeDeleteEmail) {
        res.status(401).json({ message: "Invalid Input!" });
    } else {
        // delete
        const deleteId = 'UPDATE users SET isDelete = ? WHERE id = ?';
        connection.query(deleteId, ["Deleted", sanitizeDelete], (error, results) => {
            if (error) {
                res.status(401).json({ message: "Server side error!" });
            } else {
                // send to email
                const body = `Your account on jrmsu vpred as Author was been deleted by Admin. You can't no longer access on the portal`;

                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'jrmsuvpred@gmail.com',
                        pass: 'kbwyyjspjdjerrno'
                    }
                });

                var mailOptions = {
                    from: 'jrmsuvpred@gmail.com',
                    to: sanitizeDeleteEmail,
                    subject: 'Your account was deleted!',
                    text: body
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        res.status(200).json({ message: "Account has been deleted uccessfully!" });
                    }
                });
            }
        });
    }
});

// ######################################################################  ADDING DATA AND DOCUMENT ########################################################################################
const documentUpload = multer({
    dest: 'document upload/',
});

// another sample add image
app.post('/add-data', verifyToken, documentUpload.single('file'), (req, res) => {

    const originalFileName = req.file.originalname;
    const { RorE, campus, college, research, status, proposed, started, completed, inputData, user_id } = req.body;

    // get the current date
    const currentDate = getCurrentFormattedDate();

    // authors and emails
    const authorsAndEmails = JSON.parse(inputData);

    // validate
    const validationRules = [
        { validator: validator.isLength, options: { min: 1, max: 255 } },
    ]

    // check if all field is not empty
    if (college === "" || proposed === "") {
        res.status(401).json({ message: "Invalid College or Proposed date!" });
        return;
    }

    // check the status
    let checkProposed = false;
    let checkOngoing = false;
    let checkCompleted = false;
    let proposedValue, onGoingValue, completedValue;
    let proposedSanitize, startedSanitize, completedSanitize;

    if (status === "Proposed") {
        checkProposed = true;
        proposedSanitize = sanitizeAndValidate(proposed, validationRules);
        if (!proposedSanitize) {
            res.status(401).json({ message: "Invalid Proposed Input!" });
            return;
        }
        proposedValue = proposedSanitize;
        onGoingValue = "";
        completedValue = "";
    } else if (status === "On-Going") {
        checkProposed = true;
        checkOngoing = true;
        proposedSanitize = sanitizeAndValidate(proposed, validationRules);
        startedSanitize = sanitizeAndValidate(started, validationRules);
        if (!proposedSanitize || !startedSanitize) {
            res.status(401).json({ message: "Invalid Proposed or Started Input!" });
            return;
        }
        proposedValue = proposedSanitize;
        onGoingValue = startedSanitize;
        completedValue = "";
    } else if (status === "Completed") {
        checkProposed = true;
        checkOngoing = true;
        checkCompleted = true;
        proposedSanitize = sanitizeAndValidate(proposed, validationRules);
        startedSanitize = sanitizeAndValidate(started, validationRules);
        completedSanitize = sanitizeAndValidate(completed, validationRules);
        if (!proposedSanitize || !startedSanitize || !completedSanitize) {
            res.status(401).json({ message: "Invalid Proposed, Started, or Completed Input!" });
            return;
        }
        proposedValue = proposedSanitize;
        onGoingValue = startedSanitize;
        completedValue = completedSanitize;
    }

    const RorESanitize = sanitizeAndValidate(RorE, validationRules);
    const campusSanitize = sanitizeAndValidate(campus, validationRules);
    const collegeSanitize = sanitizeAndValidate(college, validationRules);
    const researchSanitize = sanitizeAndValidate(research, validationRules);
    const statusSanitize = sanitizeAndValidate(status, validationRules);
    const userIdSanitize = sanitizeAndValidate(user_id, validationRules);

    if (!RorESanitize || !campusSanitize || !collegeSanitize || !researchSanitize || !statusSanitize || !userIdSanitize) {
        res.status(401).json({ message: "Invalid Input!" });
    }
    else {
        // const fileExtension = originalFileName.split('.').pop();

        const uniqueFileName = `${Date.now()}_${originalFileName}`;
        const uniqueFilePath = `document upload/${uniqueFileName}`;

        // Move to uploaded file to the unique file path
        fs.rename(req.file.path, uniqueFilePath, (err) => {
            if (err) {
                res.status(401).json({ message: "Error moving the upload file!" });
            } else {
                const sanitizedFileName = sanitizeHtml(req.file.originalname); // Sanitize HTML content
                if (!validator.isLength(sanitizedFileName, { min: 1, max: 255 })) {
                    return res.status(401).send({ message: "Invalid File Name!" });
                }
                else {
                    if (req.file.size > 5242880) {
                        res.status(401).json({ message: "File is too large!" });
                    }
                    else {
                        // Check if the uploaded file has a PDF or DOCX extension
                        const mimeType = mime.lookup(sanitizedFileName);
                        if (mimeType !== 'application/pdf' && mimeType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                            res.status(401).json({ message: "Invalid file type! Accepted file PDF and Docx extension." })
                        }

                        else {
                            // // Generate a unique identifier (timestamp) and append it to the original file name
                            const uniqueFileName = Date.now() + '_' + sanitizedFileName;

                            const query = 'INSERT INTO all_research_data (file_name, RorE, campus, college, research, status, proposed, started, completed, added_by, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                            connection.query(query, [uniqueFileName, RorESanitize, campusSanitize, collegeSanitize, researchSanitize, statusSanitize, proposedValue, onGoingValue, completedValue, "Admin", currentDate], (err, results) => {
                                if (err) {
                                    res.status(401).json({ message: "Server side error!" });
                                }
                                else {
                                    // get inserted id
                                    const insertedDataId = results.insertId;

                                    // send notification to sender
                                    const senderContent = `You've successfully added ${researchSanitize} as ${RorE} from ${campusSanitize} campus in ${collegeSanitize}`;
                                    const receiverContent = `Admin added your ${researchSanitize}`;

                                    // insert sender notification
                                    const senderNotification = 'INSERT INTO notification (user_id, content, date) VALUES (?, ?, ?)';
                                    connection.query(senderNotification, [userIdSanitize, senderContent, currentDate], (error, results) => {
                                        if (error) {
                                            res.status(401).json({ message: "Server side error!" });
                                        } else {
                                            // insert author to database
                                            // generate password
                                            const characters = "abcdefjhigklmnopqrstuvwxyzABCDEFJHIGKLMNOPQRSTUVWXYZ1234567890";
                                            const password = Array.from({ length: 10 }, () => characters[Math.floor(Math.random() * characters.length)]).join('');

                                            // create hash
                                            const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

                                            // Insert authors and emails with the main id
                                            const insertAuthorsQuery = `INSERT INTO users (data_id, fullname, email, password, RorE, campus, college, rank, added_by, date, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                                            const authorPromises = authorsAndEmails.map(item => {
                                                return new Promise((resolve, reject) => {
                                                    const theAUthor = item.author;
                                                    connection.query(insertAuthorsQuery, [insertedDataId, item.author, item.email, hashedPassword, RorESanitize, campusSanitize, collegeSanitize, "Author", "Admin", currentDate, "givenProfile.png"], (authorErr, authorResult) => {
                                                        if (authorErr) {
                                                            reject(authorErr);
                                                        } else {
                                                            // resolve(authorResult);
                                                            // get insert Id
                                                            const insertedId = authorResult.insertId;

                                                            // insert notification
                                                            const recieverNotification = 'INSERT INTO notification (user_id, content, date) VALUES (?, ?, ?)';
                                                            connection.query(recieverNotification, [insertedId, receiverContent, currentDate], (error, results) => {
                                                                if (error) {
                                                                    reject(error);
                                                                } else {
                                                                    resolve(results);
                                                                    // insert sender notification for adding account
                                                                    const senderAddAccountContent = `You've successfully added ${theAUthor} as author account`;

                                                                    const addAccountNotification = 'INSERT INTO notification (user_id, content, date)';
                                                                    connection.query(addAccountNotification, [userIdSanitize, senderAddAccountContent, currentDate], (error, allResults) => {
                                                                        if (error) {
                                                                            reject(error);
                                                                        }
                                                                        else {
                                                                            // resolve(allResults);
                                                                            // insert notification for the author for adding account
                                                                            const authorContent = `Admin added your account`;
                                                                            const authorAddNotification = 'INSERT INTO notification (insert_id, content, date) VALUES (?, ?, ?)';
                                                                            connection.query(authorAddNotification, [insertedId, authorContent, currentDate], (error, lastResults) => {
                                                                                if (error) {
                                                                                    reject(error);
                                                                                } else {
                                                                                    resolve(lastResults);
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                            })
                                                        }
                                                    });
                                                });
                                            });

                                            Promise.all(authorPromises)
                                                .then(() => {
                                                    // success
                                                    // send to email
                                                    const sendMultipleEmails = authorsAndEmails.map(item => {
                                                        return new Promise((resolve, reject) => {

                                                            const body = `Hi ${item.author}! Your ${RorESanitize} entitled ${researchSanitize} has been available on this link: (sample link) which added by Admin. Login using this Email ${item.email} and Password ${password}`;

                                                            var transporter = nodemailer.createTransport({
                                                                service: 'gmail',
                                                                auth: {
                                                                    user: 'jrmsuvpred@gmail.com',
                                                                    pass: 'kbwyyjspjdjerrno'
                                                                }
                                                            });

                                                            var mailOptions = {
                                                                from: 'jrmsuvpred@gmail.com',
                                                                to: `${item.email}`,
                                                                subject: `Published ${RorESanitize}!`,
                                                                text: body
                                                            };
                                                            transporter.sendMail(mailOptions, function (error, info) {
                                                                if (error) {
                                                                    reject(error);
                                                                } else {
                                                                    resolve(info);
                                                                }
                                                            });
                                                        });
                                                    });

                                                    Promise.all(sendMultipleEmails).then(() => {
                                                        res.status(200).json({ message: "Data and Author has been successfully added! And email code was sent successfully!" });
                                                    })
                                                        .catch(error => {
                                                            console.error('Error inserting sending emails: ', error);
                                                            res.status(401).json({ message: "An error occured while sending email" });
                                                        });
                                                })
                                                .catch(authorError => {
                                                    console.error('Error inserting authors and emails:', authorError);
                                                    res.status(401).json({ message: 'An error occurred while inserting authors and emails' });
                                                });
                                        }
                                    });
                                }
                            });
                        }
                    }
                }
            }
        });

    }
});

// #####################################################################    FETCH ALL RESEARCH AND EXTENSION DATA  ######################################################################################
app.get('/fetch/all-RorE', verifyToken, (req, res) => {
    // fetch data
    const unitData = 'SELECT * FROM all_research_data WHERE isDelete = ?';
    connection.query(unitData, ["not"], (error, results) => {
        if (error) {
            res.status(401).json({ message: 'Server side error!' });
        }
        else {
            if (results.length > 0) {
                //success
                res.status(200).json({ results });
            }
            else {
                res.status(401).json({ message: "Something went wrong!" });
            }
        }
    });
});

// #####################################################################    DOWNLOAD RESEARCH OR EXTENSION DOCUMENT  ######################################################################################
// app.use('/document upload', express.static('document upload'));
app.use('/upload document', express.static(path.join(__dirname, 'upload document')));

app.post('/download/RorE/document', verifyToken, (req, res) => {
    const { downloadDocument } = req.body;

    const validationRules = [
        { validator: validator.isLength, options: { min: 1, max: 50 } }
    ]
    const idSanitized = sanitizeAndValidate(downloadDocument, validationRules);

    if (!idSanitized) {
        res.status(401).json({ message: "Invalid Id" });
    } else {

        res.status(200).json({ message: "Verified!" });
    }
});

// ##################################################################   FETCH ALL AUTHOR BY EACH ID  ########################################################################################
app.post('/fetch/each-author', verifyToken, (req, res) => {
    const { updateIdString } = req.body;

    // validate
    const validationRules = [
        { validator: validator.isLength, options: { min: 1, max: 50 } }
    ];
    const validatedId = sanitizeAndValidate(updateIdString, validationRules);
    if (!validatedId) {
        res.status(401).json({ message: "Invalid Input!" });
    }
    else {
        const selectAuthor = 'SELECT * FROM users WHERE data_id = ? AND isDelete = ?';
        connection.query(selectAuthor, [validatedId, "not"], (error, results) => {
            if (error) {
                res.status(401).json({ message: "Server side error!" });
            }
            else {
                if (results.length > 0) {
                    res.status(200).json({ results });
                } else {
                    res.status(401).json({ message: "Something went wrong!" });
                }
            }
        });
    }
});

// #####################################################################    UPDATE RESEARCH OR EXTENSION DATA  ######################################################################################
app.post('/update/data', verifyToken, documentUpload.single('file'), (req, res) => {

    // const { user_id, completed, started, proposed, college, research, status, campus, RorE, id } = req.body;
    // res.status(200).json({messsage: college, college: college});
    let checkFile = true;

    if (!req.file) {
        checkFile = false;
    }

    const { id, RorE, campus, college, research, status, proposed, started, completed, user_id } = req.body;

    // get the current date
    const currentDate = getCurrentFormattedDate();

    // validate
    const validationRules = [
        { validator: validator.isLength, options: { min: 1, max: 255 } },
    ]

    // check if all field is not empty
    if (college === "" || proposed === "") {
        res.status(401).json({ message: "Invalid College or Proposed date!" });
        return;
    }

    // // check the status
    let checkProposed = false;
    let checkOngoing = false;
    let checkCompleted = false;
    let proposedValue, onGoingValue, completedValue;
    let proposedSanitize, startedSanitize, completedSanitize;

    if (status === "Proposed") {
        checkProposed = true;
        proposedSanitize = sanitizeAndValidate(proposed, validationRules);
        if (!proposedSanitize) {
            res.status(401).json({ message: "Invalid Proposed Input!" });
            return;
        }
        proposedValue = proposedSanitize;
        onGoingValue = "";
        completedValue = "";
    } else if (status === "On-Going") {
        checkProposed = true;
        checkOngoing = true;
        proposedSanitize = sanitizeAndValidate(proposed, validationRules);
        startedSanitize = sanitizeAndValidate(started, validationRules);
        if (!proposedSanitize || !startedSanitize) {
            res.status(401).json({ message: "Invalid Proposed or Started Input!" });
            return;
        }
        proposedValue = proposedSanitize;
        onGoingValue = startedSanitize;
        completedValue = "";
    } else if (status === "Completed") {
        checkProposed = true;
        checkOngoing = true;
        checkCompleted = true;
        proposedSanitize = sanitizeAndValidate(proposed, validationRules);
        startedSanitize = sanitizeAndValidate(started, validationRules);
        completedSanitize = sanitizeAndValidate(completed, validationRules);
        if (!proposedSanitize || !startedSanitize || !completedSanitize) {
            res.status(401).json({ message: "Invalid Proposed, Started, or Completed Input!" });
            return;
        }
        proposedValue = proposedSanitize;
        onGoingValue = startedSanitize;
        completedValue = completedSanitize;
    }

    const sanitizeId = sanitizeAndValidate(id, validationRules);
    const sanitizeRorE = sanitizeAndValidate(RorE, validationRules);
    const sanitizeCampus = sanitizeAndValidate(campus, validationRules);
    const sanitizeCollege = sanitizeAndValidate(college, validationRules);
    const sanitizeResearch = sanitizeAndValidate(research, validationRules);
    const sanitizeStatus = sanitizeAndValidate(status, validationRules);
    const sanitizeUserId = sanitizeAndValidate(user_id, validationRules);

    if (!sanitizeId || !sanitizeRorE || !sanitizeCampus || !sanitizeCollege || !sanitizeResearch || !sanitizeStatus) {
        res.status(401).json({ message: "Invalid Input!" });
    }
    else {
        // get data on there id to add on history
        const getDataId = 'SELECT * FROM all_research_data WHERE id = ?';
        connection.query(getDataId, [sanitizeId], (error, results) => {
            if (error) {
                res.status(401).json({ message: "Server side error!" });
            } else {
                // get the data
                const data = results;

                // insert data to history
                const historyPromise = data.map(item => {
                    return new Promise((resolve, reject) => {
                        const insertHistory = 'INSERT INTO history (research, status, proposed, started, completed, campus, RorE, college, added_by, date, file_name, data_id, publicize, originality, similarity, history_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
                        connection.query(insertHistory, [item.research, item.status, item.proposed, item.started, item.completed, item.campus, item.RorE, item.college, item.added_by, item.date, item.file_name, sanitizeId, item.publicize, item.originality, item.similarity, currentDate], (error, results) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(results);
                            }
                        });
                    });
                });
                Promise.all(historyPromise).then(() => {
                    // success
                    // insert to database without file
                    const insertData = 'UPDATE all_research_data SET RorE = ?, campus = ?, college = ?, research = ?, status = ?, proposed = ?, started = ?, completed = ? WHERE id = ?';
                    connection.query(insertData, [sanitizeRorE, sanitizeCampus, sanitizeCollege, sanitizeResearch, sanitizeStatus, proposedValue, onGoingValue, completedValue, sanitizeId], (error, results) => {
                        if (error) {
                            res.status(401).json({ message: "Server side error" });
                        } else {
                            // success
                            if (checkFile) {
                                const originalFileName = req.file.originalname;
                                // insert file
                                const uniqueFileName = `${Date.now()}_${originalFileName}`;
                                const uniqueFilePath = `document upload/${uniqueFileName}`;

                                fs.rename(req.file.path, uniqueFilePath, (err) => {
                                    if (err) {
                                        res.status(401).json({ message: "Error moving the upload file!" });
                                    }
                                    else {
                                        const sanitizedFileName = sanitizeHtml(req.file.originalname);
                                        if (!validator.isLength(sanitizedFileName, { min: 1, max: 255 })) {
                                            return res.status(401).json({ message: "Invalid File Name!" });
                                        } else {
                                            if (req.file.size > 5242880) {
                                                res.status(401).json({ message: "File is too large!" });
                                            } else {
                                                // check the file extension
                                                const mimeType = mime.lookup(sanitizedFileName);
                                                if (mimeType !== 'application/pdf' && mimeType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                                                    res.status(401).json({ message: "Invalid file type! Accepted file PDF and Docx extension." })
                                                }
                                                else {
                                                    // // Generate a unique identifier (timestamp) and append it to the original file name
                                                    const uniqueFileName = Date.now() + '_' + sanitizedFileName;
                                                    const updateDocumentFile = 'UPDATE all_research_data SET file_name = ? WHERE id = ?';
                                                    connection.query(updateDocumentFile, [uniqueFileName, sanitizeId], (error, results) => {
                                                        if (error) {
                                                            res.status(401).json({ message: "Data has been updated but file is not uploaded!" });
                                                        } else {
                                                            // success
                                                            const receiverContent = `Your ${sanitizeResearch} was updated by the Admin to ${sanitizeStatus}`;
                                                            const senderContent = `You updated ${sanitizeResearch} to status ${sanitizeStatus}`;

                                                            // insert reciever notification
                                                            const insertNotification = 'INSERT INTO notification (user_id, content, date) VALUES (?, ?, ?)';
                                                            connection.query(insertNotification, [sanitizeId, receiverContent, currentDate], (error, results) => {
                                                                if (error) {
                                                                    res.status(401).json({ message: "Server side Error!" });
                                                                } else {
                                                                    // insert sender notification
                                                                    const senderNotification = 'INSERT INTO notification (user_id, content, date) VALUES (?, ?, ?)';
                                                                    connection.query(senderNotification, [sanitizeUserId, senderContent, currentDate], (error, results) => {
                                                                        if (error) {
                                                                            res.status(401).json({ message: "Server side error!" });
                                                                        } else {
                                                                            res.status(200).json({ message: "Data has been updated!" });
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    }
                                });
                            } else {
                                res.status(200).json({ message: "Data has been updated!" });
                            }
                        }
                    });
                })
                    .catch(historyError => {
                        console.log('Error adding data to history!: ', historyError);
                        res.status(401).json({ message: "Error inserting data to history!" });
                    });
            }
        });
    }
});

// #####################################################################    DELETE REARCH OR EXTENSION DATA  ######################################################################################
app.post('/delete/data', verifyToken, (req, res) => {
    const { deleteIdString } = req.body;

    const validationRules = [
        { validator: validator.isLength, options: { min: 1, max: 50 } }
    ]

    const sanitizeDelete = sanitizeAndValidate(deleteIdString, validationRules);

    if (!sanitizeDelete) {
        res.status(401).json({ message: "Invalid Input!" });
    } else {
        // get the email of each users
        const getEmail = 'SELECT * FROM users WHERE data_id = ? AND isDelete =?';
        connection.query(getEmail, [sanitizeDelete, "not"], (error, results) => {
            if (error) {
                res.status(401).json({ message: "Server side error!" });
            } else {
                // get emails
                const emails = results;

                // delete data
                const deleteData = 'UPDATE all_research_data SET isDelete = ? WHERE id = ?';
                connection.query(deleteData, ["Deleted", sanitizeDelete], (error, results) => {
                    if (error) {
                        res.status(401).json({ message: "Server side error!" });
                    } else {
                        const authorPromises = emails.map(item => {
                            return new Promise((resolve, reject) => {
                                // send to email
                                const body = `Your account on jrmsu vpred as Author was been deleted by Admin. You can't no longer access on the portal`;

                                var transporter = nodemailer.createTransport({
                                    service: 'gmail',
                                    auth: {
                                        user: 'jrmsuvpred@gmail.com',
                                        pass: 'kbwyyjspjdjerrno'
                                    }
                                });

                                var mailOptions = {
                                    from: 'jrmsuvpred@gmail.com',
                                    to: `${item.email}`,
                                    subject: 'Your account was deleted!',
                                    text: body
                                };

                                transporter.sendMail(mailOptions, function (error, info) {
                                    if (error) {
                                        // console.log(error);
                                        reject(error);
                                    } else {
                                        resolve(info);
                                    }
                                });
                            });
                        });

                        Promise.all(authorPromises)
                            .then(() => {
                                // success
                                res.status(200).json({ message: "Data has been successfully deleted!" });
                            })
                            .catch(authorError => {
                                console.error('Error inserting authors and emails:', authorError);
                                res.status(401).json({ message: 'Data has been deleted but Email information not sent!' });
                            });
                    }
                });
            }
        });
    }
});

// #####################################################################    END ON ADMIN SIDESIDE  ######################################################################################

// #####################################################################    SAMPLE FETCHING IMAGE SIDE  ######################################################################################
// to include foler uploads

app.get('/fetchImage/:id', (req, res) => {
    const userId = req.params.id;
    const sql = 'SELECT * FROM users WHERE id = ?';

    connection.query(sql, [userId], (err, rows) => {
        if (err) {
            console.error('Error fetching data from MySQL:', err);
            res.status(500).json({ error: 'Error fetching data from the server.' });
        } else if (rows.length === 0) {
            res.status(404).json({ error: 'User not found.' });
        } else {
            const user = rows[0];
            const userData = {
                imagePath: user.file_path,
                username: user.username,
                password: user.password,
            };
            res.json(userData);
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
