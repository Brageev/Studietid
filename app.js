const sqlite3 = require('better-sqlite3')
const path = require('path')
const db = sqlite3('./studietid.db', {verbose: console.log})
const express = require('express')
const app = express()

const session = require('express-session');
const bcrypt = require('bcrypt');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());



const saltRounds = 10;
//post a navbar





// Konfigurere 
app.use(session({
    secret: 'hemmelig_nøkkel',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Sett til true hvis du bruker HTTPS
}));
function checkLoggedIn(req, res, next) {
    if (req.session.loggedIn) {
        console.log('Bruker logget inn:', req.session.user);
        return next();
    } else {
        res.redirect('/login/');
    }
}

function checkAdmin(req, res, next) {
    console.log('Bruker logget inn:', req.session.user);

    if (req.session.loggedIn && req.session.user.isAdmin == 1) {
        console.log('Bruker er admin');
        return next();
    } else {
        res.redirect('/app/');
    }
}

const staticPath = path.join(__dirname, 'public')
app.use(express.urlencoded({ extended: true })) // To parse urlencoded parameters
app.use(express.json()); // To parse JSON bodies

app.get('/', checkLoggedIn, (req, res) => {
    res.sendFile(path.join(staticPath, './app/index.html'));
});

app.get('/app', checkLoggedIn, (req, res) => {
    res.sendFile(path.join(staticPath, './app/index.html'));
});
app.get('/app', checkLoggedIn, (req, res) => {
    res.sendFile(path.join(staticPath, './'));
});


app.get('/register', checkLoggedIn, (req, res) => {
    res.sendFile(path.join(staticPath, './register/index.html'));
});

app.get('/historikk', checkLoggedIn, (req, res) => {
    res.sendFile(path.join(staticPath, './historikk/index.html'));
});

app.get('/admin/index.html', checkAdmin, (req, res) => {
    console.log("admin");
    res.sendFile(path.join(staticPath, './admin/index.html'));
});

app.get('/admin', checkAdmin, (req, res) => {
    console.log("admin");
    res.sendFile(path.join(staticPath, './admin/index.html'));
});


function checkValidEmailFormat(email) {

    // Step 1: Split the email into two parts: local part and domain part
    let parts = email.split('@');

    // Email should have exactly one "@" symbol
    if (parts.length !== 2) {
        return false;
    }

    let localPart = parts[0];
    let domainPart = parts[1];

    // Step 2: Ensure neither the local part nor the domain part is empty
    if (localPart.length === 0 || domainPart.length === 0) {
        return false;
    }

    // Step 3: Check if domain part contains a "."
    if (!domainPart.includes('.')) {
        return false;
    }

    // Step 4: Split the domain into name and extension
    let domainParts = domainPart.split('.');

    // Ensure there is both a domain name and an extension
    if (domainParts.length < 2) {
        return false;
    }

    let domainName = domainParts[0];
    let domainExtension = domainParts[1];

    // Step 5: Validate that both the domain name and extension are non-empty
    if (!domainName || !domainExtension) {
        return false;
    }

    // Step 6: Ensure domain extension is at least 2 characters long (e.g., ".com")
    if (domainExtension.length < 2) {
        return false;
    }

    // Step 7: Additional checks (optional)
    // - Local part should not start or end with a special character
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
        return false;
    }

    // - Domain name should not start or end with a special character
    if (domainName.startsWith('-') || domainName.endsWith('-')) {
        return false;
    }

    // If all checks pass, return true
    return true;

}

function checkEmailExists(email) {

    let sql = db.prepare("select count(*)  as count from user where email = ?")
    let result = sql.get(email);
    console.log("result.count", result)
    if (result.count > 0) {
        console.log("Email already exists")
        return false;
    }
    return true;

}

function checkEmailregex(email) {
    const emailRegex = /^[^\s@\.][^\s@]*@[^\s@]+\.[^\s@]+$/;
    let result = emailRegex.test(email);
 
    if (!result) {
        return false;
    }


}


app.post('/declineactivity', checkLoggedIn, (req, res) => {
    const { id } = req.body;
    console.log("decline activity with id:22", id);
    const sql = db.prepare("UPDATE activity SET idstatus = 1 WHERE id = ?");
    const result = sql.run(id);

    if (result.changes === 0) {
        return res.json({ error: 'Failed to decline activity.' });
    }

    res.json({ success: 'Activity declined successfully.' });
        
});


// Middleware to inject navbar HTML into every response
app.use((req, res, next) => {
    res.locals.navbar = `
        <nav>
            <ul>
                <li><a href="/app/">Home</a></li>
                <li><a href="//">App</a></li>
                <li><a href="/register/">Ny Studietime</a></li>
                <li><a href="/historikk/">Historikk</a></li>
                ${req.session.loggedIn && req.session.user.isAdmin ? '<li><a href="/admin/">Admin</a></li>' : ''}
            </ul>
        </nav>
    `;
    next();
});

// Route to serve the navbar HTML
app.get('/navbar', (req, res) => {
    res.send(res.locals.navbar);
});

app.post('/acceptactivity', checkLoggedIn, (req, res) => {

    const{ id }  = req.body;
    console.log("accept activity with id:22", id);
    const sql = db.prepare("UPDATE activity SET idstatus = 3 WHERE id = ?");
    const result = sql.run(id);

    if (result.changes === 0) {
        return res.json({ error: 'Failed to accept activity.' });
    }

    res.json({ success: 'Activity accepted successfully.' });

});


app.post('/adduser', (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    // Validate email format and check if email already exists
    if (!checkValidEmailFormat(email)) {
        return res.json({ error: 'Invalid email format.' });
    } else if (!checkEmailExists(email)) {
        res.redirect('app/index.html?errorMsg=EmailExist');
    } else {
        // Insert new user
        const newUser = addUser(firstName, lastName, 2, 0, email, password);

        if (!newUser) {
            return res.json({ error: 'Failed to register user.' });
        }
        
        res.redirect('/app/');
    }
});

app.post('/addactivity', checkLoggedIn, (req, res) => {
    const {time, room, subject} = req.body;


    console.log('Bruker logsssssssget inn:', req.session.user);  
    console.log('Bruker logsssssssget inn:', req.session.user.id);  
    const date = new Date();  
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let currentDate = `${day}-${month}-${year}`;
  
    const newActivity = addActivity(req.session.user.id, time, room, subject, 2, 60, currentDate);

    if (!newActivity) {
        return res.json({ error: 'Failed to register activity.' });
    }
    
    res.redirect('./app/index.html')
});

function addActivity(idUser, time, room, subject, status, duration, currentDate) {
    console.log("THE THINGS: ", idUser, room, subject, status);
    sql = db.prepare("INSERT INTO activity (idUser, startTime, idRoom, idSubject, idStatus, duration, date) " +
                         "values (?, ?, ?, ?, ?, ?, ?)")
    const info = sql.run(idUser, time, room, subject, status, duration, currentDate)
    
    sql = db.prepare('SELECT activity.id as activityId, date, startTime, room.name as room, subject.name as subject, status.name as status, duration ' + 
        'FROM activity ' +
        'INNER JOIN room ON activity.idRoom = room.id ' +
        'INNER JOIN subject ON activity.idSubject = subject.id ' +
        'INNER JOIN status ON activity.idStatus = status.id ' +
        'INNER JOIN user ON activity.idUser = user.id ' +

        'WHERE activity.id = ?');
    let rows = sql.all(info.lastInsertRowid)  
    console.log('row inserted', rows[0])

    return rows[0]

}

function addUser(firstName, lastName, idRole, isAdmin, email, password)
 {

    password = bcrypt.hashSync(password, saltRounds);

    sql = db.prepare("INSERT INTO user (firstName, lastName, idRole, isAdmin, email, password) " +
                         "values (?, ?, ?, ?, ?, ?)")
    const info = sql.run(firstName, lastName, idRole, isAdmin, email, password)
    
    sql = db.prepare('SELECT user.id as userid, firstname, lastname, role.name  as role ' + 
        'FROM user inner join role on user.idrole = role.id   WHERE user.id  = ?');
    let rows = sql.all(info.lastInsertRowid)  
    console.log('row inserted', rows[0])

    return rows[0]
}

app.get('/getusers/', checkLoggedIn, checkAdmin, (req, resp) => {
    console.log('/getusers/')

    const sql = db.prepare('SELECT user.id as userid, firstname, lastname, role.name  as role ' + 
        'FROM user inner join role on user.idrole = role.id ');
    let users = sql.all()   
    console.log("users.length", users.length)
    
    resp.send(users)
})

app.get('/getrooms/', checkLoggedIn,  (req, resp) => {
    console.log('/getrooms/')

    const sql = db.prepare('SELECT * FROM room');
    let rooms = sql.all()   
    console.log("rooms.length", rooms.length)
    
    resp.send(rooms)
})

app.get('/getsubjects/', checkLoggedIn, (req, resp) => {
    console.log('/getsubjects/')

    const sql = db.prepare('SELECT * FROM subject');
    let subjects = sql.all()   
    console.log("subjects.length", subjects.length)
    
    resp.send(subjects)
})



app.get('/getactivities/', checkLoggedIn, (req, resp) => {
    if (req.session.user.isAdmin == 0) {

        console.log('/getactivities/')

        const sql = db.prepare('SELECT activity.id as id, startTime, date, room.name as room, subject.name as subject, status.name as status, duration, ' +
            'user.firstname as userFirstName, user.lastname as userLastName, status.id as statusid ' +
            'FROM activity ' +
            'INNER JOIN room ON activity.idroom = room.id ' +
            'INNER JOIN subject ON activity.idsubject = subject.id ' +
            'INNER JOIN status ON activity.idstatus = status.id ' +
            'INNER JOIN user ON activity.idUser = user.id ' +
            'WHERE activity.idUser = ?'
        );
        let activities = sql.all(req.session.user.id);


        console.log("activities.length", activities.length)
        console.log(activities + "testtesttest")
        resp.send(activities)  
    }
    if (req.session.user.isAdmin == 1) {
        console.log('/getactivities/')
        const sql = db.prepare('SELECT activity.id as id, startTime, date, room.name as room, subject.name as subject, status.name as status, duration, ' +
            'user.firstname as userFirstName, user.lastname as userLastName, status.id as statusid ' +
            'FROM activity ' +
            'INNER JOIN room ON activity.idroom = room.id ' +
            'INNER JOIN subject ON activity.idsubject = subject.id ' +
            'INNER JOIN status ON activity.idstatus = status.id ' +
            'INNER JOIN user ON activity.idUser = user.id ' 
        );
        let activities = sql.all()
        console.log("activities.length", activities.length)
        console.log(activities + "testtesttest")
        resp.send(activities)
        
    }
})

app.use(express.static(staticPath));
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    // Finn brukeren basert på brukernavn
    const user = db.prepare('SELECT * FROM user WHERE email = ?').get(email);
    
    if (!user) {
        return res.status(401).send('Ugyldig email eller passord');
    }
   
    // Sjekk om passordet samsvarer med hash'en i databasen
    const isMatch = await bcrypt.compare(password, user.password);
    user.password = undefined;
    if (isMatch) {
        // Lagre innloggingsstatus i session
        req.session.loggedIn = true;
        req.session.email = user.email;
        req.session.user = user;


        //DETTE REDIRECTER TIL APP INDEX.HTML
        if (user.isAdmin == 1) {
            res.redirect('/admin/index.html');
        } else {
            res.redirect('/app/index.html');
        }
        console.log("user " + user)
    } else {
        return res.status(401).send('Ugyldig email eller passord');
    }
    
});

// Beskyttet rute som krever at brukeren er innlogget
app.get('.app/index.html', checkLoggedIn, (req, res) => {
    if (req.session.loggedIn) {
        res.send(`Velkommen, ${req.session.email}!`);
    } else {
        res.status(403).send('Du må være logget inn for å se denne siden.');
    }
});
