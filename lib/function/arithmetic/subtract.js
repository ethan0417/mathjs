module.exports = function (math) {
  var util = require('../../util/index'),

      BigNumber = require('bignumber.js'),
      Complex = require('../../type/Complex'),
      Matrix = require('../../type/Matrix'),
      Unit = require('../../type/Unit'),
      collection = require('../../type/collection'),

      toNumber = util.number.toNumber,
      toBigNumber = util.number.toBigNumber,
      isBoolean = util.boolean.isBoolean,
      isNumber = util.number.isNumber,
      isComplex = Complex.isComplex,
      isUnit = Unit.isUnit,
      isCollection = collection.isCollection;

  /**
   * Subtract two values
   *
   *     x - y
   *     subtract(x, y)
   *
   * For matrices, the function is evaluated element wise.
   *
   * @param  {Number | BigNumber | Boolean | Complex | Unit | Array | Matrix} x
   * @param  {Number | BigNumber | Boolean | Complex | Unit | Array | Matrix} y
   * @return {Number | BigNumber | Complex | Unit | Array | Matrix} res
   */
  math.subtract = function subtract(x, y) {
    if (arguments.length != 2) {
      throw new util.error.ArgumentsError('subtract', arguments.length, 2);
    }

    if (isNumber(x)) {
      if (isNumber(y)) {
        // number - number
        return x - y;
      }
      else if (isComplex(y)) {
        // number - complex
        return new Complex (
            x - y.re,
            - y.im
        );
      }
    }
    else if (isComplex(x)) {
      if (isNumber(y)) {
        // complex - number
        return new Complex (
            x.re - y,
            x.im
        )
      }
      else if (isComplex(y)) {
        // complex - complex
        return new Complex (
            x.re - y.re,
            x.im - y.im
        )
      }
    }

    if (x instanceof BigNumber) {
      if (isNumber(y)) {
        // try to convert to big number, if not possible, downgrade to Numbers
        y = toBigNumber(y);
        if (isNumber(y)) {
          return toNumber(x) - y;
        }
      }

      if (y instanceof BigNumber) {
        return x.minus(y);
      }
    }
    if (y instanceof BigNumber) {
      if (isNumber(x)) {
        // try to convert to big number, if not possible, downgrade to Numbers
        x = toBigNumber(x);
        if (isNumber(x)) {
          return x - toNumber(y);
        }
      }

      if (x instanceof BigNumber) {
        return x.minus(y)
      }
    }

    if (isUnit(x)) {
      if (isUnit(y)) {
        if (!x.equalBase(y)) {
          throw new Error('Units do not match');
        }

        if (x.value == null) {
          throw new Error('Unit on left hand side of operator - has an undefined value');
        }

        if (y.value == null) {
          throw new Error('Unit on right hand side of operator - has an undefined value');
        }

        var res = x.clone();
        res.value -= y.value;
        res.fixPrefix = false;

        return res;
      }
    }

    if (isCollection(x) || isCollection(y)) {
      return collection.deepMap2(x, y, subtract);
    }

    if (isBoolean(x)) {
      return subtract(+x, y);
    }
    if (isBoolean(y)) {
      return subtract(x, +y);
    }

    throw new util.error.UnsupportedTypeError('subtract', x, y);
  };
};