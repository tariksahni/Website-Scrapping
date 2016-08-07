'use strict';
var request = require('co-request');
var cheerio = require('cheerio');
var co = require('co');
var Excel = require('exceljs');
var async = require('async');
var workbook = new Excel.Workbook();
var worksheet = workbook.addWorksheet('OMBOOKS');
var _ = require('lodash');
var page_no = 0;
var link = 0;
var link1 = 0;
var pages_processed = 0;
var sleep = require('sleep');
const BaseUrl = "http://www.ombooks.com/home-books/search?page=";
const LastSectionUrl = "&_xhr=1";
const MainUrl = "http://www.ombooks.com";
var fileName = "OMBOOKS";

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
    header: "Features",
    key: "features",
    width: 30
  },
  {
    header: "Images",
    key: "imageUrls",
    width: 30
  },
  {
    header: "MRP",
    key: "price",
    width: 15
  },
  {
    header: "Description",
    key: "description",
    width: 30
  },
  {
    header: "Author",
    key: "author",
    width: 15
  },
  {
    header: "Model Number",
    key: "ean",
    width: 15
  },
  {
    header: "Language",
    key: "lang",
    width: 15
  },
  {
    header: "Publisher",
    key: "publ",
    width: 15
  },
  {
    header: "Binding",
    key: "bind",
    width: 15
  },
  {
    header: "Published Date",
    key: "pdate",
    width: 15
  },
  {
    header: "ISBN",
    key: "isbn",
    width: 15
  },
  {
    header: "Number of Pages",
    key: "nop",
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
  // console.log(url1);
  co(function*() {
    // console.log("yes");
    pages_processed++;


    if (pages_processed % 1000 == 0) {
      // console.log("Inside changing code");
      fileCounter++;
      fileName = fileBaseName + "-" + fileCounter;
      workbook = new Excel.Workbook();
      worksheet = workbook.addWorksheet(fileName);

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
          header: "Features",
          key: "features",
          width: 30
        },
        {
          header: "Images",
          key: "imageUrls",
          width: 30
        },
        {
          header: "MRP",
          key: "price",
          width: 15
        },
        {
          header: "Description",
          key: "description",
          width: 30
        },
        {
          header: "Author",
          key: "author",
          width: 15
        },
        {
          header: "Model Number",
          key: "ean",
          width: 15
        },
        {
          header: "Language",
          key: "lang",
          width: 15
        },
        {
          header: "Binding",
          key: "bind",
          width: 15
        },
        {
          header: "Published Date",
          key: "pdate",
          width: 15
        },
        {
          header: "Publisher",
          key: "publ",
          width: 15
        },
        {
          header: "ISBN",
          key: "isbn",
          width: 15
        },
        {
          header: "Number of Pages",
          key: "nop",
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

    }

    let result = yield request(url1);

    let response = result;
    let body = result.body;

    var $ = cheerio.load(body, {
      xmlMode: true
    });


    var url = url1.replace(/(\r\n|\n|\r)/gm, "");

    var price = $('div.our_price span.m-w').text().trim();
    var author,
      ean,
      isbn,
      nop,
      bind,
      pdate,
      publ,
      features,
      lang,
      title;
    $('div[id="features"] ul').find('li').each(function() {
      var tt1 = $(this).text().trim();
      var tt = $(this).children('label').text().trim();
      var myString = tt1.replace(tt, '').trim();
      var mys = myString.replace(':', '').trim();

      if (tt == "Title") {
        title = mys ;
      }

      if (tt == "Author") {
        author = mys ;
      }
      if (tt == "Publisher") {
        publ = mys ;
      }
      if (tt == "ISBN") {
        isbn = mys ;
      }
      if (tt == "EAN") {
        ean = mys ;
      }
      if (tt == "Binding") {
        bind = mys ;
      }
      if (tt == "Published Date") {
        pdate = mys ;
      }
      if (tt == "Number Of Pages") {
        nop = mys ;
      }
      if (tt == "Language") {
        lang = mys ;
      }
    });


    var path = "Home | Books";


    var imageUrls = $('div#catalog-images img').attr('src').replace('45x45', '400x400');
    var keywords ,
      description;
    description = $('div#description').text().trim().replace(/(\r\n|\n|\r)/gm, "");
    description.replace('frameborder="0" allowfullscreen> ', "");
    var saveObject = {
      url: url,
      title: title,
      imageUrls: imageUrls,
      price: price,
      description: description,
      author: author,
      ean: ean,
      lang: lang,
      nop: nop,
      isbn: isbn,
      pdate: pdate,
      publ: publ,
      bind: bind,
      path: path,
      keywords: keywords
    };
    // Save to Excel

    worksheet.addRow(saveObject).commit();

    yield workbook.xlsx.writeFile("ombooks401-500.xlsx").then(function() {
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


var fetchProductUrls = async.queue(function(url, callback) {
  co(function*() {
    let result = yield request(url);
    let response = result;
    let body = result.body;
    var $ = cheerio.load(body, {
      xmlMode: true
    });
    $('ul[id="search-result-items"] li').each(function(i, li) {
      // console.log(li);
      $(li).find('div.variant-image a').each(function(i, l) {
        var url22 = $(l).attr('href');
        // console.log(url22);
        var url221 = MainUrl.concat(url22);
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
}, 2);

fetchProductInfo.drain = function() {
  console.log('All products processed'.blue);
  process.exit(1);
};

var init = function() {
  for (var i = 401; i <= 500; i++) {
    co(function*() {
      // console.log(BaseUrl + i + LastSectionUrl);
      fetchProductUrls.push(BaseUrl + i + LastSectionUrl, function(err) {
        link++;
        console.log('Link - ' + link + ' finished processing - Links Left - ' + fetchProductUrls.length());
      });
    }).then(function(value) {});
  }
  console.log("After fetch urls");
};

console.log("started scraping OMBOOKS!!!")
init();