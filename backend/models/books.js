const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    
    imageUrl: { type: String, required: true },
    genre: { type: String, required: true },
    year: { type: Number, required: true },
    averageRating: { type: Number, default: 0 },
    ratings: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, rating: Number }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Book', bookSchema);
