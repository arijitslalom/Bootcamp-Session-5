const app = require('./app');
const { loadSeedData } = require('./todoStore');

const PORT = process.env.PORT || 3001;

// Load pre-made tasks
loadSeedData();

// INTENTIONAL ISSUE: Missing error handling for server startup
app.listen(PORT, () => {
  // Server started successfully
});
