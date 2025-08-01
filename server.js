const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/search/:query/:type', async (req, res) => {
  try {
    const { query, type } = req.params;
    if (!['title', 'author', 'subject'].includes(type)) {
      return res.status(400).json({ error: 'Invalid search type' });
    }
    const url = `https://openlibrary.org/search.json?${type}=${encodeURIComponent(query)}`;
    const response = await axios.get(url);
    const books = response.data.docs.slice(0, 10).map(book => ({
      title: book.title || 'Unknown',
      author: book.author_name ? book.author_name.join(', ') : 'Unknown',
      year: book.first_publish_year || 'N/A',
      cover: book.cover_id ? `https://covers.openlibrary.org/b/id/${book.cover_id}-S.jpg` : null
    }));
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch book data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
