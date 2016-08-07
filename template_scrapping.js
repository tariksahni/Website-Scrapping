'use strict';
var request = require('co-request');
var cheerio = require('cheerio');
var co = require('co');
var Excel = require('exceljs');
var async = require('async');
var workbook = new Excel.Workbook();
var worksheet = workbook.addWorksheet('DATA');
var _ = require('lodash');
var page_no = 0;
var link = 0;
var link1 = 0;
var pages_processed = 0;
var sleep = require('sleep');
const BaseUrls = [""];
const MainUrl = "";
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
    header: "Ink Colour",
    key: "ic",
    width: 15
  },
  {
    header: "Brand",
    key: "brand",
    width: 15
  },
  {
    header: "Description",
    key: "description",
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
    var title = $('div#pb-left-column h1').text().trim();
    var url = url1.replace(/(\r\n|\n|\r)/gm, "");
    var imageUrls;
    $('ul#thumbs_list_frame li').find('img').each(function(i ,image){
      if(i==0)imageUrls = $(this).attr('src').replace('medium','large');
      else {imageUrls += "," ; imageUrls += $(this).attr('src').replace('medium','large');}
    });
    // console.log(imageUrls);
    var brand = "Uniball";
    var price = $('span#our_price_display').text().trim();
    var description = $('div#short_description_content').find('span').text().trim();
    var path = "View All Collections|";
    var ic;
    $('div.attribute_list option').each(function(i,optiosn){
      if (i==0)ic = $(this).attr('title');
      else { ic += ","; ic+= $(this).attr('title') ; }
    });
    path += title ;
    var keywords = "NA";
    var saveObject = {
      url: url,
      title: title,
      imageUrls: imageUrls,
      brand:brand,
      ic:ic,
      description:description,
      price:price,
      path: path,
      keywords:keywords 
    };
    worksheet.addRow(saveObject).commit();
    yield workbook.xlsx.writeFile(".xlsx").then(function() {
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
    $('').each(function(i, li) {
      $(li).find('').each(function(j, l) {
        var url221 = $(l).attr('href');
        fetchProductInfo.push(url221, function(err) {
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
  for(var i =0 ; i < BaseUrls.length ; i++){
    co(function*() {
      fetchProductUrls.push(BaseUrls[i], function(err) {
        link++;
        console.log('Link - ' + link + ' finished processing - Links Left - ' + fetchProductUrls.length());
      });
    }).then(function(value) {});
  }
  
  console.log("After fetch urls");
};

console.log("started scraping !!!")
init();