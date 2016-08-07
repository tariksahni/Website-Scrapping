'use strict';
var request = require('co-request');
var cheerio = require('cheerio');
var co = require('co');
var fs = require('fs');
var Excel = require('exceljs');
var async = require('async');
var workbook = new Excel.Workbook();
var worksheet = workbook.addWorksheet('DATA1');
var _ = require('lodash');
var page_no = 0;
var pages =0 ;
var link = 0;
var link1 = 0;
var pages_processed = 0;
var sleep = require('sleep');
const BaseUrl = [""];
const MainUrl = "http://www.dailyobjects.com";
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
    header: "Price",
    key: "price",
    width: 30
  },
  {
    header: "MRP",
    key: "mrp",
    width: 30
  },

  {
    header: "Featues",
    key: "features",
    width: 15
  },
  {
    header: "TYPE/SIZES",
    key: "sizes",
    width: 15
  },
  {
    header: "Designer",
    key: "designer",
    width: 30
  },
  {
    header: "Description",
    key: "description",
    width: 15
  },
  {
    header: "Colors",
    key: "colors",
    width: 30
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
    var title = $('h1.product-name').text().trim();
    var url = url1.replace(/(\r\n|\n|\r)/gm, "");
    var imageUrls = "";
    $('div.owl-item ').find('a.elevatezoom-gallery').each(function(i,li){
      $(li).find('img').each(function(j,image){
        var imageUrls_temp = $(image).attr('src');
        imageUrls += imageUrls_temp.split('?')[0];
        imageUrls += " ; " ;
      });
    });
    var description = $('p.product-description').text().trim();
    var designer = $('span.d_name').text().trim();
    var mrp,price ;
    $('span.product-price').each(function(i,price){
      if(i == 0){
        price = $(price).text().trim();
      }
       if(i == 1){
        mrp = $(price).text().trim();
      }
    });
    var features = "";
    $('div.product-feature ul').each(function(){
      features += $(this).text().trim();
      features += ' ; ';
    });
    var path ;
    $('div.breadcrumbs li').each(function(){
      path += $(this).text();
      path += ' | ' ;
    });
    var sizes ;
    $('select#change-device option').each(function(){
      sizes += $(this).text();
      sizes += ' ; ' ;
    });
    var colors;
    $('ul.wood_case_type li').each(function(){
      colors += $(this).text();
      colors += ' ; ' ;
    });
    var keywords ="NA";
    var saveObject = {
      url: url,
      title: title,
      imageUrls: imageUrls,
      description:description,
      designer:designer,
      mrp:mrp,
      price:price,
      features:features,
      path:path,
      sizes:sizes,
      colors:colors,
      keywords:keywords
    };
    console.log(saveObject);
    // worksheet.addRow(saveObject).commit();
    // yield workbook.xlsx.writeFile(".xlsx").then(function() {
    //   console.log("Row added & Saved");
    // });
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


fetchProductInfo.drain = function() {
  console.log('All products processed'.blue);
  process.exit(1);
};

var init = function() {
  co(function*() {
    var input = fs.readFileSync('/home/tarik/Desktop/scraping projects/scraper/daily_object.html');
    var  $ = cheerio.load(input);
    $('ul').find('li').each(function(i,li){
      $(li).find('a').each(function(j,aElem){
        var url111 = $(aElem).attr('href');
        if (url111 != undefined){
          var url11 = MainUrl.concat(url111);
        }
        co(function*() {
          fetchProductInfo.push(url11, function(err) {
            pages++;
            console.log('Page - ' + pages + ' finished processing - Pages Left - ' +
            fetchProductInfo.length() + '\n');
          });
        }).then(function(value) {
        }).catch(function(err) {
        });
      });
    });
  }).then(function(value) {
  }).catch(function(err) {
  });
}

console.log("started scraping !!!")
init();