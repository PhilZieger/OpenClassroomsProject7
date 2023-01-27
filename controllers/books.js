const Book = require('../models/Book');
const fs = require('fs');

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

exports.getTopBooks = (req, res, next) => {
  Book.find().sort({averageRating:-1}).limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

exports.createBooks = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
      ...bookObject,
      _userId: req.auth._userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  book.save()
      .then(() => { res.status(201).json({ message: 'Objet enregistré !'})})
      .catch(error => { res.status(400).json( { error })});

};

exports.modifyBook = (req, res, next) => {
  const thingBook = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete thingBook._userId;
  Book.findOne({_id: req.params.id})
      .then((book) => {
          if (book.userId != req.auth.userId) {
              res.status(401).json({ message : 'Non autorisé'})
          } else {
              Book.updateOne({ _id: req.params.id}, { ...thingBook, _id: req.params.id})
              .then(() => res.status(200).json({ message: 'Objet modifié'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => { res.status(400).json({ error })});
};

exports.rateBook = (req, res, next) => {
  const thingBook = {...req.body} ;

  Book.findOne({_id: req.params.id})
      .then((books) => {
        const newrate = (books.averageRating + thingBook.rating) / 2;
        Book.updateOne({ _id: req.params.id}, { $push: { ratings: { ...thingBook } }, $set:{averageRating: newrate }, _id: req.params.id })
          .then(() => {
              Book.findOne({_id: req.params.id})
                .then(book => res.status(200).json(book))
                .catch(error => res.status(401).json({ error }));
            })
            .catch(error => res.status(401).json({ error }));
      })
      .catch((error) => { res.status(400).json({ error })});
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id})
      .then(book => {
          if (book.userId != req.auth.userId) {
              res.status(401).json({ message: 'Non autorisé'});
          } else {
              const filename = book.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                Book.deleteOne({_id: req.params.id})
                      .then(() => res.status(200).json({message: 'Objet suprimé'}))
                      .catch(error => res.status(401).json({ error }));
              })
          }
      })
      .catch( error => { res.status(500).json({ error })});
};

exports.getOneBook = (req, res, next) => {
  if (req.params.id === 'bestrating' ) {
    next();
  } else {
    Book.findOne({ _id: req.params.id })
      .then(book => res.status(200).json(book))
      .catch(error => res.status(404).json({ error }));
  }
  
};