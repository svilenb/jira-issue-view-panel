export default function routes(app, addon) {
    // Redirect root path to /atlassian-connect.json,
    // which will be served by atlassian-connect-express.
    app.get('/', (req, res) => {
        res.redirect('/atlassian-connect.json');
    });

    app.get('/linked-bugs', (req, res) => {
        res.render('linked-bugs.jsx', {
            issueKey: req.query['issueKey'],
            // browserOnly: true
        });
    });
}
