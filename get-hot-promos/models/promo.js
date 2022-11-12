"use strict";

/**
 * Class Promo
 */
class Promo {
  /**
   * Constructor method for Promo
   * @param {String} id
   * @param {Number} temp
   * @param {String} title
   * @param {String} link
   * @param {Date} created_at
   * @param {String} price
   */
  constructor(
    id = "",
    temp = 0,
    title = "",
    link = "",
    price,
    created_at = new Date()
  ) {
    this.id = id;
    this.temp = temp;
    this.title = title;
    this.link = link;
    this.price = price;
    this.created_at = created_at;
  }

  /**
   * Static method to generate a new Instance from a raw Item from cheerio.
   * @param {*} rawArticle
   */
  static newInstance(rawArticle) {
    return new Promo(
      rawArticle.attr("id"),
      this.extractHTML(rawArticle, ".vote-temp--hot, .vote-temp--burn"),
      this.extractAttr(rawArticle, ".thread-link", "title"),
      this.extractAttr(rawArticle, ".thread-link", "href"),
      this.extractHTML(rawArticle, ".thread-price")
    );
  }

  /**
   * Static method to return an array of Promos from a DynamoDB result.
   * @param {Array} array
   */
  static batchFromRaw(array) {
    const promos = [];
    array.forEach((elem) => {
      promos.push(
        new Promo(
          elem.id,
          elem.temp,
          elem.title,
          elem.link,
          elem.price,
          new Date(elem.created_at)
        )
      );
    });
    return promos;
  }

  /**
   * Cheerio helper method to scrap HTML from selector
   * @param {*} elem
   * @param {String} selector
   */
  static extractHTML(elem, selector) {
    const value = elem.find(selector).html();
    if (value) {
      return value.trim();
    }
    return null;
  }

  /**
   * Cheerio helper method to get an attribute of an element
   * @param {*} elem
   * @param {String} selector
   * @param {String} attr
   */
  static extractAttr(elem, selector, attr) {
    const value = elem.find(selector).attr(attr);
    if (value) {
      return value.trim();
    }
    return null;
  }
}

module.exports = Promo;
