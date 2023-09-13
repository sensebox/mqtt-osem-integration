'use strict';

const jwt = require('jsonwebtoken');
const { ForbiddenError } = require('restify-errors');

const { User } = require('@sensebox/opensensemap-api-models');

const config = require('config');
const {
  algorithm: jwt_algorithm,
  issuer: jwt_issuer,
  secret: jwt_secret,
} = config.get('jwt');

const jwtInvalidErrorMessage = 'Invalid JWT authorization. Please sign in to obtain new JWT.';
const jwtVerifyOptions = {
  algorithms: [jwt_algorithm],
  issuer: jwt_issuer,
};

const verifyJwt = function verifyJwt (socket, next) {
  // Check if Authorization header is present
  const rawAuthorizationHeader = socket.handshake.headers.authorization;
  if (!rawAuthorizationHeader) {
    return next(new ForbiddenError(jwtInvalidErrorMessage));
  }

  const [bearer, jwtString] = rawAuthorizationHeader.split(' ');
  if (bearer !== 'Bearer') {
    return next(new ForbiddenError(jwtInvalidErrorMessage));
  }

  // Verify JWT token
  jwt.verify(jwtString, jwt_secret, jwtVerifyOptions, function (err, decodedJwt) {
    if (err) {
      return next(new ForbiddenError(jwtInvalidErrorMessage));
    }

    User.findOne({
      email: decodedJwt.sub.toLowerCase(),
      role: decodedJwt.role,
    })
      .exec()
      .then(function (user) {
        if (!user) {
          throw new Error();
        }

        // TODO: Check if deviceId is owned by user

        return next();
      })
      .catch(function () {
        return next(new ForbiddenError(jwtInvalidErrorMessage));
      });
  }
  );
};

module.exports = {
  verifyJwt
};
