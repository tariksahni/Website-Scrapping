'use strict';
var request = require('request-promise');
var cheerio = require('cheerio');
var co = require('co');
var async = require('async');
var sleep = require('sleep');
var _ = require('lodash');
var Excel = require('exceljs');
var pages = 0;
var productPages = 0;
var urlencode = require('urlencode');
var workbook = new Excel.Workbook();
var worksheet = workbook.addWorksheet('Casio Calculators');
var baseUrl = 'http://www.casioindiashop.com/Handler/ProductShowcaseHandler.ashx';

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
  }, {
    header: "Brand",
    key: "brand",
    width: 20
  }, {
    header: "SKU",
    key: "sku",
    width: 20
  }, {
    header: "ManufacturerId",
    key: "manufacturerId",
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
    header: "Category",
    key: "category",
    width: 15
  },
  {
    header: "Key Features",
    key: "keyFeatures",
    width: 15
  }
];

var checkIfProductPage = async.queue(function(obj, callback) {
  co(function*() {
    let url1 = obj.url;
    let result = yield request(url1);
    let response = result;
    // console.log(result);
    var $ = cheerio.load(result);
    var url = url1;
    var img = '';
    var brand = '';
    var title = '';
    var keyFeatures = '';
    var currency = '';
    var offeredPrice = '';
    var mrp = '';
    var features = '';
    let br = '<br>';

    $('div.productdetailbucket div').each(function(nx, divEl) {
      if ($(divEl).hasClass('productdetail_leftdiv')) {
        let imgDiv = $(divEl).find('div.productimagediv').first();
        let imgAnch = $(imgDiv).find('a').first();
        let y = $(imgAnch).find('img').attr('src');
        img = y;
        var abtBrand = $(divEl).find('div.ctl_aboutbrand').first();
        let h = $(abtBrand).find('h1').text().trim();
        $(abtBrand).find('div').each(function(ix, divb) {
          let span = $(divb).find('span');
          if ($(span).attr('itemprop') === 'brand') {
            brand = $(span).text().trim();
          }
          $(span).find('ul li').each(function(c, li) {
            keyFeatures += $(li).text().trim() + ',';
          });
        });
        

        $(divEl).find('div').each(function(xx, divElm) {
          if ($(divElm).hasClass('rightpane_main')) {
            let ldivElm = $(divElm).find('div.rightpane_left').first();
            $(ldivElm).find('div.ctl_aboutproduct').first().find('li').each(function(pp, lx) {
              keyFeatures += $(lx).text().trim() + ',';
            });
            let rdivElm = $(divElm).find('div.ctl_productdetail').first();
            mrp = $(divElm).find('div.ctl_productdetail').first().find('span.mrp').first().find('span.sp_amt').text().trim();
          }
        });
      }

      if ($(divEl).hasClass('productdetail_rightdiv')) {
        let productInfo = $(divEl).find('div.product_info').first();
        $(productInfo).find('div.desc_scrl').first().find('p').each(function(ll, px) {
          features += $(px).text() + ','; //.trim();
        });

        if (features.length === 0) {
          features += $(productInfo).find('div.desc_scrl').first().html(); //.trim();
        }

        $(productInfo).find('div.desc_scrl').first().find('b').each(function(ll, bx) {
          let r = $(bx).text(); //.trim();
          features = features.replace(r, '');
        });

        features = features.replace(new RegExp(br, 'g'), ' ');

        $(productInfo).find('div.desc_scrl').first().find('ul').first().find('li').each(function(ll, uli) {
          keyFeatures += $(uli).text() + ',';
        });
      }
    });
    // console.log(obj);
    // console.log(url);
    // console.log(title);
    // console.log(img);
    // console.log(brand);
    // console.log(keyFeatures);
    // console.log(mrp);
    // console.log(features);
    title = obj.title;

    let saveObject = {
      url:url,
      title:title,
      brand:brand,
      imageUrls: img,
      manufacturerId: obj.productId,
      price: mrp,
      features:features,
      category:obj.category,
      keyFeatures:keyFeatures,
      sku: obj.sku,
      category: obj.category,
      productId:obj.productId
    };

    // if ($('div').hasClass('body-c1')) {
    worksheet.addRow(saveObject).commit();;

    yield workbook.xlsx.writeFile('Casio_Calculators.xlsx').then(function() {
      console.log('Row added & Saved');
    });

    //Wait for some time before next call
    var stop = new Date().getTime();
    while (true) {
      if (new Date().getTime() > stop + 2000) {
        callback();
        break;
      }
    }
  // } else {
  //   console.log(url1 + ' - Not Product');
  //   callback();
  // }
  }).catch(function(err) {
    console.error(err);
    callback();
  });
}, 1);

function fetchSiteUrls() {
  co(function*() {
    console.log('Inside fetchSiteUrls');
    try {
      for (let i = 1; i < 10; i++) { // 10
        let pst = "{%22PgControlId%22:2406349,%22IsConfigured%22:true,%22ConfigurationType%22:%22%22,%22CombiIds%22:%22%22,%22PageNo%22:"
          + i.toString()
          + ",%22DivClientId%22:%222406349_CU00186905%22,%22SortingValues%22:%22CS%22,%22ShowViewType%22:%22H%22,%22PropertyBag%22:null,%22IsRefineExsists%22:false,%22CID%22:%22CU00186905%22,%22CT%22:0,%22TabId%22:%220%22,%22LocationIds%22:%220%22,%22CurrencyCode%22:%22INR%22,%22ContentType%22:%22B%22}";

        let urlTo = baseUrl + '?ProductShowcaseInput=' + pst;

        let postOptions = {
          uri: urlTo,
          method: 'GET'
        };

        let result = yield request(postOptions);
        // console.log(result);
        var $ = cheerio.load(result, {
          xmlMode: true
        });

        $('div.bucket').each(function(cxc, divProd) {
          let data = $(divProd);
          //console.log($(data).attr('data-ProductId'));
          // console.log(data['data-ProductId']);
          let obj = {};
          obj.productId = $(data).attr('data-ProductId');
          obj.sku = $(data).attr('data-Sku');
          obj.title = $(data).attr('data-Title');
          obj.price = $(data).attr('data-Price');
          obj.category = $(data).attr('data-Category');
          obj.brand = $(data).attr('data-Brand');
          $(divProd).find('div.bucket_left').each(function(index, divElem) {
            let link = $(divElem).find('a').first().attr('href');
            //console.log(link);
            obj.url = link
            co(function*() {
              checkIfProductPage.push(obj, function(err) {
                pages++;
                console.log('Page - ' + pages + ' finished processing - Pages Left - ' +
                  checkIfProductPage.length() + '\n');
              });
            }).then(function(value) {
              console.log(value);
            }).catch(function(err) {
              console.log(err)
            });
          });
        });
      }
    } catch (err) {
      console.log(err);
    }
  }).then(function(value) {
    console.log(value);
  }).catch(function(err) {
    console.error(err.stack);
  });
}

checkIfProductPage.drain = function() {
  console.log('All pages processed');
  process.exit(1);
};

var init = function() {
  fetchSiteUrls();
  console.log('After fetch urls');
};

console.log('Starting HP Crawling....');
init();