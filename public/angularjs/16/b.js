angular.module("MyB", [])
.service('store', function(){
	var TestObject = AV.Object.extend("TestObject");
	var query = new AV.Query(TestObject);
	// query.equalTo("foo", "hello");
    return {
        TestObject: TestObject,
        query: query
    }
})