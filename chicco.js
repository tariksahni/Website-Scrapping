'use strict';
var request = require('co-request');
var cheerio = require('cheerio');
var co = require('co');
var fs = require('fs');
var Excel = require('exceljs');
var async = require('async');
var workbook = new Excel.Workbook();
var worksheet = workbook.addWorksheet('CHICCO26');
var _ = require('lodash');
var page_no = 0;
var link = 0;
var link1 = 0;
var pages_processed = 0;
var sleep = require('sleep');
const BaseUrl = [
  "http://www.chicco.in/chicco-products/pregnancy-and-breastfeeding/All.html",
  "http://www.chicco.in/chicco-products/mealtimes/all.html",
  "http://www.chicco.in/chicco-products/hygiene-and-protection/all.html",
  "http://www.chicco.in/chicco-products/toys/all.html",
  "http://www.chicco.in/chicco-products/clothing-and-shoes/all.html",
  "http://www.chicco.in/chicco-products/out-about-and-travelling/all.html",
  "http://www.chicco.in/chicco-products/sleeptime-and-relaxation/all.html"
];
const LastSectionUrl = "";
const MainUrl = "http://www.chicco.in";
var fileName = "CHICCO";

worksheet.columns = [
  {
    header: "URL",
    key: "url",
    width: 30
  },
  {
    header: "Product Code",
    key: "productCode",
    width: 20
  },
  {
    header: "Title",
    key: "title",
    width: 20
  },
  {
    header: "Age Group",
    key: "ageGroup",
    width: 20
  },
  {
    header: "Images",
    key: "imageUrls",
    width: 30
  },
  {
    header: "Path",
    key: "path",
    width: 30
  },
  {
    header: "Specification",
    key: "specification",
    width: 30
  },
  {
    header: "Description",
    key: "description",
    width: 30
  },
  {
    header: "Keywords",
    key: "keywords",
    width: 30
  }
];


var fetchProductInfo = async.queue(function(url1, callback) {
  // console.log(url1);
  co(function*() {
    // console.log("yes");
    pages_processed++;

    let url = url1;
    console.log(url);

    let result = yield request(url);
    let response = result;
    let body = result.body;
    var $ = cheerio.load(body, {
      xmlMode: true
    });

    let productCode = $('div.product-id').text().trim();

    let title = $('div.productName').text().trim();

    let ageGroup = $('div.age').text().trim();

    let imageUrls = $('meta[property="og:image"]').attr('content');

    let path = "Home";
    $('div.breadcrumbs a').each(function(i, a) {
      path += $(a).text().trim();
      path += " | ";
    });
    path += "^";

    let specification = $('div.subtitle').text().trim();

    let description = $('div.description p').text().trim();

    let keywords = $('meta[name="keywords"]').attr('content');

    var saveObject = {
      url: url,
      productCode: productCode,
      title: title,
      ageGroup: ageGroup,
      imageUrls: imageUrls,
      path: path,
      specification: specification,
      description: description,
      keywords: keywords
    };

    console.log(saveObject);
    // Save to Excel

    worksheet.addRow(saveObject).commit();

    yield workbook.xlsx.writeFile("chicco.xlsx").then(function() {
      console.log("Row added & Saved");
    });


    //Wait for some time before next call
    var stop = new Date().getTime();
    while (true) {
      if (new Date().getTime() > stop + 2000) {
        callback();
        break;
      }
    }

  }).catch(function(err) {
    console.error(err);
    callback();
  });
}, 3);


var fetchProductUrls = async.queue(function(url1, callback) {
  co(function*() {
    for (let i = 0; i <= 0; i++) {
      let result = yield request(BaseUrl[i]);
      let response = result;
      let body = result.body;
      var $ = cheerio.load(body, {
        xmlMode: true
      });
      $('div.product-list div.product-name').each(function(j, li) {
        let url = MainUrl + $(li).find('a').attr('href');
        //console.log(url);
        fetchProductInfo.push(url, function(err) {
          link1++;
          console.log('Product - ' + link1 + ' finished processing - Links Left - ' + fetchProductInfo.length() + "\n");
        });
      });
    }
    var stop = new Date().getTime();
    while (true) {
      if (new Date().getTime() > stop + 3500) {
        callback();
        break;
      }
    }
  }).catch(function(err) {
    console.error(err);
    callback();
  });
}, 2);

fetchProductInfo.drain = function() {
  console.log('All products processed');
  process.exit(1);
};

var init = function() {
  co(function*() {
    fetchProductUrls.push(0, function(err) {
      link++;
      console.log('Link - ' + link + ' finished processing - Links Left - ' + fetchProductUrls.length());
    });
  }).then(function(value) {});
  console.log("After fetch urls");
};

console.log("started scraping CHICCO!!!")
init();