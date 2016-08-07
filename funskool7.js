'use strict';
var request = require('co-request');
var cheerio = require('cheerio');
var co = require('co');
var Excel = require('exceljs');
var async = require('async');
var workbook = new Excel.Workbook();
var worksheet = workbook.addWorksheet('ASICS');
var _ = require('lodash');
var page_no = 0;
var link = 0;
var link1 = 0;
var pages_processed = 0;
var sleep = require('sleep');
const BaseUrl = "https://www.asicsindia.in/products/";
const MainUrl = "https://www.asicsindia.in";
worksheet.columns = [
  {
    header: "URL",
    key: "url",
    width: 30
  },
  {
    header: "Title",
    key: "title",
    width: 20
  },
  {
    header: "Images",
    key: "imageUrls",
    width: 30
  },
  {
    header: "Product Code",
    key: "prodcode",
    width: 30
  },
  {
    header: "Sizes",
    key: "size",
    width: 15
  },
  {
    header: "Colour Code",
    key: "ccode",
    width: 15
  },
  {
    header: "Brand",
    key: "brand",
    width: 15
  },
  {
    header: "Made for",
    key: "made",
    width: 15
  },
  {
    header: "Colour",
    key: "colour",
    width: 15
  },
  {
    header: "Path",
    key: "path",
    width: 30
  },
  {
    header: "Keywords",
    key: "keywords",
    width: 30
  }
];

var fetchProductInfo = async.queue(function(url1, callback) {
  co(function*(){
    let result = yield request(url1);
    let response = result;
    let body = result.body;
    var $ = cheerio.load(body, {
      xmlMode: true
    });
    var title = $('h1.variation_title').text().trim();
    var url = url1.replace(/(\r\n|\n|\r)/gm, "");
    var imageUrls = $('ul.slider li').find('a').first().attr('href');
    var brand = "ASICS";
    var prodcode , ccode ,colour , size ;
    $('ol.info').find('li').each(function(){
      var a1 = $(this).text().trim();
      var a2 = a1.split(':');
      var a3 = a2[0];
      var a4 = a2[1];
      if(a3 == 'Product Code')prodcode = a4 ;
      if(a3 == 'Color Code')ccode = a4 ;
      if(a3 == 'Color')colour = a4 ;
      if(a3 == 'Sizes')size = a4 ;
    });
    var made = $('div.fl strong').text().trim().split(' ')[2];
    var keywords = 'NA';
    var path = "Home  | Products"
    var saveObject = {
      url: url,
      title: title,
      imageUrls: imageUrls,
      brand:brand,
      made :made,
      ccode:ccode,
      colour:colour,
      prodcode:prodcode,
      size:size,
      path: path,
      keywords:keywords 
    };
    worksheet.addRow(saveObject).commit();
    yield workbook.xlsx.writeFile("ASICS.xlsx").then(function() {
      console.log("Row added & Saved");
    });
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
}, 1);

var fetchProductUrls = async.queue(function(url, callback) {
  co(function*() {
    let result = yield request(url);
    let response = result;
    let body = result.body;
    var $ = cheerio.load(body, {
      xmlMode: true
    });
    $('ul.g_products_list li').each(function(i, li) {
      $(li).find('a.link_arrow').each(function(j, l) {
        var url221 = $(l).attr('href');
        var url22 = MainUrl.concat(url221);
        // url22 = "https://www.asicsindia.ins/products/gel-kinsei-men/";
        fetchProductInfo.push(url22, function(err) {
          link1++;
          console.log('Product - ' + link1 + ' finished processing - Links Left - ' + fetchProductInfo.length() + "\n");
        });
      });
    });
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
}, 1);

fetchProductInfo.drain = function() {
  console.log('All products processed'.blue);
  process.exit(1);
};

var init = function() {
  
    co(function*() {
      fetchProductUrls.push(BaseUrl, function(err) {
        link++;
        console.log('Link - ' + link + ' finished processing - Links Left - ' + fetchProductUrls.length());
      });
    }).then(function(value) {});
  
  console.log("After fetch urls");
};

console.log("started scraping ASICS!!!")
init();