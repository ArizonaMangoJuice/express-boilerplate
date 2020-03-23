const {app} = require(`../index`)
const chai = require(`chai`)
const chaiHttp = require(`chai-http`)
const mongoose = require(`mongoose`)
const jwt = require(`jsonwebtoken`)

const { TEST_DATABASE_URL, JWT_SECRET } = require(`../config`)

const User = require(`../models/user`)

const expect = chai.expect
chai.use(chaiHttp)

describe(`Auth`, function() {
  

  before(function() {
    return mongoose
      .connect(TEST_DATABASE_URL)
      .then(() => mongoose.connection.db.dropDatabase())
  })

  beforeEach(function() {
    const username = `exampleUser`;
    const password = `password`;
    return User.hashPassword(password).then(hash => {
      return User.create({ username, password: hash})
    })
  })

  afterEach(function() {
    return mongoose.connection.db.dropDatabase()
  })

  after(function() {
    return mongoose.disconnect()
  })

  it('should return valid authToken', () => {
    const username = `exampleUser`;
    const password = `password`;
    return chai
      .request(app)
      .post(`/api/login`)
      .send({ username, password })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an(`object`);
        expect(res.body.authToken).to.be.a(`string`);
        const payload = jwt.verify(res.body.authToken, JWT_SECRET);

        expect(payload.user).to.not.have.property(`password`);
        expect(payload.user.username).to.equal(username);
    })
  });

  it('should reject with no credentials', () => {
    const username = `exampleUser`;
    const password = `password`;
    return chai
      .request(app)
      .post(`/api/login`)
      .send({ })
      .then(res => {
        return ;
      })
      .catch(res => {
        expect(res.response.res.statusMessage).to.equal('Bad Request');
        expect(res).to.have.status(400);
      })
  });

  it('Should reject requests with incorrect usernames', () => {
    const password = `password`;
    return chai
      .request(app)
      .post(`/api/login`)
      .send({ password})
      .then(res => {
        return ;
      })
      .catch(res => {
        expect(res.response.res.statusMessage).to.equal('Bad Request');
        expect(res).to.have.status(400);
      })
  });

  it(`Should reject requests with incorrect passwords`, () => {
    const username = `exampleUser`;
    return chai
      .request(app)
      .post(`/api/login`)
      .send({username})
      .then(res => {
        return ;
      })
      .catch(res => {
        expect(res.response.res.statusMessage).to.equal('Bad Request');
        expect(res).to.have.status(400);
      })
  })

})