const Book = require('../models/books');  
const fs = require('fs');

exports.createBook = (req, res, next) => {
    console.log(req.body.book);
    const bookObject = JSON.parse(req.body.book);  // Lecture de l'objet book envoyé
    delete bookObject._id;  // Suppression de l'ID si présent
    delete bookObject._userId;  // Suppression de l'ancien userId si présent
    console.log(bookObject); 
    const book = new Book({
        ...bookObject,  // Inclut les données du book (title, imageUrl ...)
        userId: req.auth.userId,  // Ajoute l'ID de l'utilisateur authentifié
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`  // Construction de l'URL de l'image
    });

    book.save()
        .then(() => { res.status(201).json({ message: 'Livre enregistré !' }) })  // Si tout va bien
        .catch(error => { res.status(400).json({ error }) })  // Si une erreur survient
};

exports.modifyBook = (req, res, next) => {
    Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Livre modifié !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.modifyBookWithFile = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;
    // Vérifie si c'est bien le bon utilisateur
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Livre modifié !' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteBook = (req, res, next) => {
    // Vérifie si c'est bien le bon utilisateur
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Livre supprimé !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
};

exports.getBooksList = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};

exports.getBestRatedBooks = (req, res, next) => {
    Book.find().sort({ rating: -1 }).limit(10)  // Trier par note (rating)
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};
