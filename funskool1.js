'use strict';
var request = require('co-request');
var cheerio = require('cheerio');
var co = require('co');
var Excel = require('exceljs');
var async = require('async');
var workbook = new Excel.Workbook();
var worksheet = workbook.addWorksheet('FUNSKOOL1');
var _ = require('lodash');
var page_no = 0;
var link = 0;
var link1 = 0;
var pages_processed = 0;
var sleep = require('sleep');
const BaseUrl = "http://funskoolindia.com/products/search?brandId=44&filter=true&page=";
const MainUrl = "http://www.funskoolindia.com";
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
    header: "AGE",
    key: "age",
    width: 15
  },
  {
    header: "Description",
    key: "description",
    width: 30
  },
  {
    header: "Category",
    key: "category",
    width: 15
  },
  {
    header: "EAN Code",
    key: "ean",
    width: 15
  },
  {
    header: "Brand",
    key: "brand",
    width: 15
  },
  {
    header: "Type",
    key: "type",
    width: 15
  },
  {
    header: "SkillSet",
    key: "skillset",
    width: 15
  },{
    header: "FSIL",
    key: "fsil",
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
    var title = $('div.single_product_price_con ins').text().trim();
    var url = url1.replace(/(\r\n|\n|\r)/gm, "");
    var imageUrls = $('div.single_product_slider img').attr('src').replace('tb_','');
    var description = $('ul.tabs-body p').text().trim().replace(/(\r\n|\n|\r)/gm, "");
    var fsil='NA' , ean='NA' , age='NA' , category='NA' , type='NA' , skillset='NA' , brand='NA' ;
    $('div.single_product_details ul').find('li').each(function() {
      var tt1 = $(this).text().trim().split(':');
      var tt2 = tt1[0].trim();
      var tt3 = tt1[1].trim();
      if(tt2 == "FSIL"){
        fsil = tt3 ;
      }
      if(tt2 == "EAN Code"){
        ean = tt3 ;
      }
      if(tt2 == "Age"){
        age = tt3 ;
      }
      if(tt2 == "Category"){
        category = tt3 ;
      }
      if(tt2 == "Brand"){
        brand = tt3 ;
      }
      if(tt2 == "Type"){
        type = tt3 ;
      }
      if(tt2 == "Skillset"){
        skillset = tt3 ;
      }
    });
    var path = "Home |";
    if(category == 'NA'){
      path += title;
    }
    else{
      path +=category;
      path+= " | ";
      path +=title ;
    }
    var keywords = $('meta[name="description"]').attr('content').replace(/(\r\n|\n|\r)/gm, "");
    var saveObject = {
      url: url,
      title: title,
      imageUrls: imageUrls,
      brand:brand,
      age:age,
      category:category,
      type:type,
      skillset:skillset,
      ean:ean,
      fsil:fsil,
      description: description,
      path: path,
      keywords: keywords
    };
    // console.log(saveObject);
    worksheet.addRow(saveObject).commit();
    yield workbook.xlsx.writeFile("funskool_brand(thomas&cosmos).xlsx").then(function() {
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
    $('ul.products_filter li').each(function(i, li) {
      $(li).find('div.add2cart_image a').each(function(i, l) {
        var url22 = $(l).attr('href');
        // url22 = "http://funskoolindia.com/products/120";
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
  for (var i = 1; i <= 2; i++) {
    co(function*() {
      fetchProductUrls.push(BaseUrl + i, function(err) {
        link++;
        console.log('Link - ' + link + ' finished processing - Links Left - ' + fetchProductUrls.length());
      });
    }).then(function(value) {});
  }
  console.log("After fetch urls");
};

console.log("started scraping FUNSKOOL!!!")
init();