//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import * as Path from 'path';
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
// import * as myExtension from '../extension';

// Defines a Mocha test suite to group tests of similar kind together
// suite("Extension Tests", function () {

//   // Defines a Mocha unit test
//   test("Something 1", function () {
//     assert.equal(-1, [1, 2, 3].indexOf(5));
//     assert.equal(-1, [1, 2, 3].indexOf(0));
//   });
// });

import {window,ExtensionContext} from 'vscode'
import { DepNodeProvider, Dependency } from '../nodeDependencies';
describe('扩展测试',function(){
  describe('DepNodeProvider',function(){
    it('getChildren()',function(done){
      const PROJECT_ROOT = Path.join(__dirname, '../../');
      const nodeDependenciesProvider = new DepNodeProvider(PROJECT_ROOT);
      nodeDependenciesProvider.getChildren().then(function(Dependencys){
        if(Dependencys.length>0){
          done();
        }else{
          done(new Error("没有获得有效数据..."));
        }
      },function(){
        console.log(done(new Error('Error')));
      });

    })
  });
});