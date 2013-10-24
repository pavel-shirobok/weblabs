var achivement = [
	{
		'rule':
		{
			and:
			[
				{eq:['male', '$gender']},
				'$emailConfirmed'
			]
		}
	},

	{
		rule:{gte:[18, '$age']}
	},

	{
		rule:{gte:['$killsCount', 2]}
	}
]

var user = {
	gender:'male',
	age:17,
	emailConfirmed:false,
	killsCount: 0
}

event('Материализовался пользователь:', user);
testAchivements('Проверяем на сухую');

event('Юзер взрослеет');
user.age++;
testAchivements('Проверяем');

event('Юзер подтверждает почту');
user.emailConfirmed = true;
testAchivements('Проверяем');

event('Юзер первый раз убивает');
user.killsCount++;
testAchivements('Проверяем');

event('Юзер второй раз убивает');
user.killsCount++;
testAchivements('Опа! Успех');

var pick = 5000
var achCount = 100;
var N = pick * achCount;
event('А затестим ка проверку',N, 'пользователей');
event('По', achCount, 'на каждого из', pick, 'юзеров в пике');
var str = JSON.stringify(user);
var ach = JSON.stringify(achivement);

var d = new Date();
var n = d.getTime();

for(var i = 0; i < N; i++){
	var u = JSON.parse(str);
	var a = JSON.parse(ach);

	execute(a, u, {});
}

d =  new Date();
var n2 = d.getTime();

event('Ой на это понадобилось', n2 - n, 'мс');

event('как то много...');
event('Точно это потому что мы все каждый раз десерилизовывали');
event('а теперь попробуем по закешированным версиям');
event(pick, 'юзерских рантаймов,', achCount ,' ачивок десириализуем и проверяем, каждый к каждому. Поехали' );

var d = new Date();
var n = d.getTime();

var users = [];
for(var i = 0; i < pick; i++){
	users.push(JSON.parse(str));
}

var achms = [];
for(var i = 0; i < achCount; i++){
	achms.push(JSON.parse(ach));
}

for(var i = 0; i < pick; i++){
	var u = users[i]
	for(var j = 0; j < achCount; j ++ ){
		execute(achms[j], u, {});
	}
}

d =  new Date();
var n2 = d.getTime();

event('На это потребовалось', n2 - n , 'мс');

function event(){
	var args= Array.prototype.slice.call(arguments);
	args.unshift('\n[event]');
	console.log.apply(null,args);
}

function testAchivements(){
	var res = execute(achivement, user, {});
	var args = Array.prototype.slice.call(arguments);

	args.unshift(res?'[Success]':'[Fail]');
	console.log.apply(null,args);
}

function execute(ast, inp, out){
	var ops = {};

	ops.or = function(a, b){   return a || b;   }
	ops.and = function(a, b){  return a && b;   }
	ops.eq = function(a, b){   return a == b;   }
	ops.gt = function(a, b){   return a >  b;   }
	ops.lt = function(a, b){   return a <  b;   }
	ops.gte = function(a, b){  return a >= b;   }
	ops.lte = function(a, b){  return a <= b;   }
	ops.not = function(a, b){  return a != b;   }

	for(var ruleIndex = 0; ruleIndex < ast.length; ruleIndex++){
		var rule = ast[ruleIndex];
		var ruleResult = rule_exe(rule, inp, out);
		if(ruleResult == false){
			return false;
		}
	}
	return true;

	function getValue(value){
		var type = typeof(value);
		switch(type){
			case 'number':
				return value;
				break;
			case 'object':
				return resolve_op(value);
				break;
			case 'string':
				if(value.charAt(0)=='$'){
					var varname = value.substr(1);
					return inp[varname];
				}else{
					return value;
				}
				break;
		}
	}

	function resolve_op(expr){
		for(var name in expr){
			var op = ops[name];
			if(op == undefined){
				console.log(expr, name);
			}
			var params = expr[name];
			return op(getValue(params[0]), getValue(params[1]));
		}
	}

	function rule_exe(rule){
		var condition = rule['rule'];
		var trueActions = rule['true'];
		var falseActions = rule['false'];
		return resolve_op(condition);
	}
}