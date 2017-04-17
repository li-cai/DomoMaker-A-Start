const models = require('../models');
const Domo = models.Domo;
const url = require('url');

const makerPage = (req, res) => {
  Domo.DomoModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }
    return res.render('app', { domos: docs, csrfToken: req.csrfToken() });
  });
};

const makeDomo = (req, res) => {
  if (!req.body.name || !req.body.age) {
    return res.status(400).json({ error: 'RAWR! Both name and age are required' });
  }

  const domoData = {
    name: req.body.name,
    age: req.body.age,
    faveFood: req.body.faveFood,
    owner: req.session.account._id,
  };

  const newDomo = new Domo.DomoModel(domoData);
  const domoPromise = newDomo.save();
  domoPromise.then(() => res.json({ redirect: '/maker' }));

  domoPromise.catch((err) => {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Domo already exists' });
    }
    return res.status(400).json({ error: 'An error occurred' });
  });

  return domoPromise;
};

const getDomos = (request, response) => {
  const req = request;
  const res = response;

  const query = url.parse(request.url, true).query;

  if (query.q) {
    return Domo.DomoModel.searchByName(query.q, (err, docs) => {
      if (err) {
        return res.status(400).json({ error: 'An error occurred' });
      }

      return res.json({ domos: docs });
    });
  }

  return Domo.DomoModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ domos: docs });
  });
};

module.exports = {
  makerPage,
  makeDomo,
  getDomos,
};
