const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Note = require("../models/note");

router.get("/", (req, res, next) => {
  console.log("Get request initiated");
  Note.find()
    .select("title content _id")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        notes: docs.map((doc) => {
          return {
            title: doc.title,
            content: doc.content,
            _id: doc.id,
            request: {
              type: "GET",
              url: "http://localhost:3000/notes/" + doc.title,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.header(500).json({ message: "DataBase Error on the Server" });
    });
});

router.post("/", (req, res, next) => {
  const note = new Note({
    title: req.body.title,
    content: req.body.content,
    _id: new mongoose.Types.ObjectId(),
  });
  note.save().then((result) => {
    res
      .status(201)
      .json({
        message: "New Note added Successfully!",
        createdNote: {
          title: result.title,
          content: result.content,
          _id: result.id,
          request: {
            type: "GET",
            url: "http://localhost:3000/notes/" + result.title,
          },
        },
      })
      .catch((err) => console.log(err));
  });
});

router.get("/:title", (req, res, next) => {
  const title = req.params.title;
  Note.find()
    .exec()
    .then((docs) => {
      const response = {
        note: docs.filter((doc) => {
          if (doc.title === title) {
            return {
              title: doc.title,
              _id: doc.id,
              content: doc.content,
              request: {
                type: "GET",
                url: "http://localhost:3000/notes",
              },
            };
          } else {
            return;
          }
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.patch("/:title", (req, res, next) => {
  const title = req.params.title;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Note.update({ title: title }, { $set: updateOps })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Note Updated",
        request: {
          type: "GET",
          url: "http://localhost:3000/notes/",
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.header(500).json({ error: err });
    });
});

router.delete("/:title", (req, res, next) => {
  const title = req.params.title;
  Note.remove({ title: title })
    .exec()
    .then((result) => {
      console.log(result);
      res.header(204).json({
        message: "Note Deleted",
        request: {
          type: "POST",
          url: "http://localhost:3000/notes",
          body: { title: "String", content: "String" },
        },
      });
    })
    .catch((err) => console.error(err));
});

module.exports = router;
