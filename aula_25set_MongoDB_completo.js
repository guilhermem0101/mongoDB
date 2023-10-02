//aula 28/ago
// criando novo bd inventario
use inventario
show databases


// criando a coleção empresa -> create table + insert into
db.empresa.insertOne({razão_social: "IBM do Brasil Ltda",
   endereço: {logradouro: 'Rua Tutoia', número: 100,
   bairro: 'Paraíso', cidade : 'São Paulo'} ,
   fones: [11998877665, 11998070605]})
   
   
// select * from 
db.empresa.find({})

// mais de um documento
db.empresa.insertMany([{razão_social: 'Microsoft do Brasil',
 endereço: 'Av. Engenheiro Berrini, 1000-Broklin-São Paulo' ,
 fones: [{ddd:11, número: 991234567}, 
         {ddd:11, número: 997654321}],
tipo_empresa : 'Fabricante' }, 		 
{razão_social: 'ABC Equipamentos de Informática SA',
cep: 12345678, cnpj: 123987, tipo_empresa: 'Fornecedor'} ])


// consulta com critério - WHERE e LIKE
// barra / equivale ao % do LIKE /i insentive
db.empresa.find({razão_social: /brasil/})
db.empresa.find({razão_social: /bRAsil/i})
// encontrar brasil com s ou z
db.empresa.find({razão_social: /bRA.*il/i})
// consulta com OR para encontrar cidade de são paulo 
db.empresa.find({$or: [{endereço :/s.*o paulo/i}, 
          {"endereço.cidade" : /s.*o paulo/i }] })
          
          
// aula 04/set - atualização, manipulação de vetores


// excluindo um documento repetido
db.empresa.find({_id : ObjectId("64eca8960bef2abeedf0e1a1")})
db.empresa.deleteOne({_id:ObjectId("64eca8960bef2abeedf0e1a1")} )

// atualizando um documento 
db.empresa.updateOne(
    {razão_social : /microsoft/i},
    {$set: {razão_social: 'Microsoft Corporation do Brasil Ltda.'}})

db.empresa.updateOne(
    {razão_social : /Sony/i},
    {$set: {cnpj: 3615809}})
    

// novo campo ano fundação da empresa
db.empresa.updateOne(
    {razão_social : /microsoft/i},
	{$set : {ano_fundação : 1974}} ) 
db.empresa.updateOne(
    {razão_social : /ibm/i},
	{$set : {ano_fundação : 1911}} )
	
	
// consulta com operadores numéricos
// $gt greater than / $lt lower than/ $gte gretaer or equal than
// $lte lower or equal than / $eq equal / $ne not equal 

// empresas com ano de fundação > 1911
db.empresa.find({ano_fundação : {$gt: 1911}})
// empresas com ano de fundação >= 1911
db.empresa.find({ano_fundação : {$gte: 1911}})
db.empresa.find({razão_social : /microsoft/i})

   .projection({})
   .sort({_id:-1})
   .limit(100)

// diferente de 1974
db.empresa.find({ano_fundação : {$ne: 1974}})
// menor que 1990 e empresas ltda 
db.empresa.find({ano_fundação : {$lt: 1990} ,
                 razão_social: /ltda/i })	
db.empresa.find({$and: [{ano_fundação : {$lt: 1990}} ,
	                    {razão_social: /ltda/i }])
// razao social termina com ltda
db.empresa.find({ano_fundação : {$lt: 1990} ,
                 razão_social: /ltda$/i })
// empresas que a razão social começa com I
db.empresa.find ({razão_social: /^a/i })
// manipulando vetores fones: [{ddd:11, número: 991234567}, 
//                             {ddd:11, número: 997654321}]
// incluindo um novo fone 
db.updateOne({razão_social : /microsoft/i} ,
	{$set : {"fones" : {$push: {ddd:11, número: 997650000}}}})

db.empresa.find({tipo : /fornec/i})

// 
db.empresa.find({$and: [{ano_fundação : {$gt: 1911}}, {razão_social: /microsoft/i}]})

	
// aula 11/setembro - Relacionamentos entre coleções
// nova coleção Equipamento
db.equipamento.insertOne (
    {patrimonio : 100,
    marca : 'Lenovo', tipo_eqpto : 'Computador',
    características : {processador : 'I5', 
    velocidade_GHZ: 3.2, memória_GB: 8, tipo: 'Notebook'}})

db.equipamento.insertOne(
    {patrimonio: 101,
    marca : 'LG', tipo_eqpto: 'Periférico',
    características : {tipo: 'Monitor LCD', 
    resolução: '1900x1200', tamanho_pol : 19} } )
    





db.equipamento.find()
// relacionando equipamento com fornecedor



db.empresa.updateOne({razao_social: /faisca/i},
// arrumando a razao_social
{$rename: {'razao_social' : 'razão_social'}})

// criar a referencia para o fornecedor ABC
db.equipamento.updateOne ({patrimonio:100},
	{$set: {cnpj_fornecedor: 123987}} )
	
// relacionando equipamento e fornecedor
db.equipamento.find()
db.empresa.aggregate(
    {$match: {tipo_empresa: /fornec/i}}
    {$lookup :
    	{from : 'equipamento' ,
    	 localField : 'cnpj', 
    	 foreignField: 'cnpj_fornecedor' ,
    	 as : 'eqptos_fornecidos'
    }
    })

// Aula 18-set - Aggregate com filtros
// verificando se existe o cnpj para fazer o JOIN (lookup)
db.empresa.aggregate([
    {$match: {cnpj: {$exists: true}}},
    {$lookup :
    	{from : "equipamento" ,
    	 localField : "cnpj", 
    	 foreignField: "cnpj_fornecedor" ,
    	 as : "eqptos_fornecidos"
    }
    }]).pretty()
// equipamentos do tipo computador, empresas com informática na razao
db.empresa.aggregate([
    {$match: {cnpj: {$exists: true}, razão_social:/inform.*tica/i}},
    {$lookup :
    	{from : "equipamento" ,
    	 localField : "cnpj", 
    	 foreignField: "cnpj_fornecedor" ,
    	 as : "eqptos_fornecidos" 
    	} 
    },
    {$unwind : "$eqptos_fornecidos"}, // $unwind transforma documentos de entrada para gerar um documento para cada elemento.
    {$match: {"eqptos_fornecidos.tipo_eqpto" : /comput/i }},
    {$project: {"_id":0 , "razão_social" : 1, "tipo_empresa":1,
     "eqptos_fornecidos.marca" : 1, 
	 "eqptos_fornecidos.características.processador" : 1 }} ])


// saindo de equipamento para empresa
db.equipamento.aggregate([
    {$match: {"cnpj_fornecedor": {$exists: true},
               "tipo_eqpto" : /comput/i }},
    {$lookup :
    	{from : "empresa" ,
    	 localField : "cnpj_fornecedor", 
    	 foreignField: "cnpj",
    	 as : "fornecedor" } 
    },
    {$unwind : "$fornecedor"} ,
    {$match: {"fornecedor.razão_social":/inform.*tica/i}},
    {$project: {"_id":0 , "marca" : 1, 
    "características.processador" : 1, 
    "fornecedor.razão_social" : 1, "fornecedor.tipo_empresa":1}} ])

// Aula 25-set - auto-relacionamento com perifericos
// criar mais 2 perifericos e aninhar no computador
db.equipamento.find()
db.equipamento.insertMany([
    {patrimonio:102, tipo_eqpto: "Periférico", marca: "Epson", 
    características : {tipo: "Impressora Laser", velocidade_ppm: 20,
                       cor: "Preto"},
    {patrimonio: 103, tipo_eqpto: "Periférico", marca: "Dell",
    características : {tipo: "Mouse sem fio", resolução_dpi: 1000,
                       botões: 3} }])
                   
db.equipamento.find({patrimonio:100})

// alocar dois periféricos no computador 100
db.equipamento.updateOne({patrimonio:100},
	{$set: {perifericos_instalados : [
    {patr_periferico:102, dt_hora_instalação: new Date("2023-06-20")},
    {patr_periferico:103, dt_hora_instalação: new Date("2023-07-25")}
]})




// mostrar o equipamento 100 e seus periféricos
db.equipamento.aggregate([
    {$match : {"patrimonio": 100}},
    {$lookup: 
        {from : "equipamento", 
    	 localField: "perifericos_instalados.patr_periferico",
    	 foreignField: "patrimonio",
    	 as: "instalados_perifericos"  
        } 
    } 
])
	 
	 
// aplicando filtros
db.equipamento.aggregate([
    {$match : {"tipo_eqpto": /comput/i}},
    {$lookup: 
        {from : "equipamento", 
    	 localField: "perifericos_instalados.patr_periferico",
    	 foreignField: "patrimonio",
    	 as: "instalados_perifericos"  } }
    	 {$unwind: "$instalados_perifericos" },
    {$match : {"instalados_perifericos.características.tipo": /impres/i}},
    {$project: {"_id":0, "patrimonio": 1, "marca": 1,
    "características.processador" : 1,
    "instalados_perifericos.patrimonio" :1 ,
    "instalados_perifericos.marca" : 1,
    "instalados_perifericos.características.tipo" : 1,
    "perifericos_instalados.dt_hora_instalação" : 1 }
    } 
])


	  
// coleção Software
db.software.insertMany([
    {id: "WIN11", nome: "Windows 11 Professional", tipo: "SO",
    versão : "11R22.2"},
    {id: "ORA21", nome: "RDBMS Oracle", tipo: "SGBD",
    versão : "21.01"},
    {id: "PWRBI", nome: "Power BI", tipo: "Visualizador Dados",
     versão : "2.120.731.0"}
])
     
     
db.software.find()
// instalando os softwares no notebook 100
db.equipamento.updateOne({patrimonio:100},
	{$set: {softwares_instalados : [
		{software : "WIN11", dt_hora_instalação: new Date()},
	    {software : "PWRBI", dt_hora_instalação: new Date()} ] } } )
	    
	    
db.equipamento.find({"patrimonio" : 100}).pretty()


// mostrando dados do equipamento e softwares instalados
db.equipamento.aggregate([
{$match : {"tipo_eqpto": /comput/i}},
{$lookup: 
    {from : "software" ,
	 localField : "softwares_instalados.software", 
     foreignField : "id" ,
     as : "sw_instalados" } } ] ) 
     
// mostrando também o fornecedor
db.equipamento.aggregate([
    {$match : {"tipo_eqpto": /comput/i}},
    {$lookup: 
        {from : "software" ,
    	 localField : "softwares_instalados.software", 
         foreignField : "id" ,
         as : "sw_instalados" } } ,
    {$lookup :
    	{from : "empresa" ,
    	 localField : "cnpj_fornecedor", 
    	 foreignField: "cnpj",
    	 as : "fornecedor" } } ] ) 
    	 
// mostrando também o fornecedor, projetando alguns campos
db.equipamento.aggregate([
{$match : {"tipo_eqpto": /comput/i}},
{$lookup: 
    {from : "software" ,
	 localField : "softwares_instalados.software", 
     foreignField : "id" ,
     as : "sw_instalados" } } ,
{$lookup :
	{from : "empresa" ,
	 localField : "cnpj_fornecedor", 
	 foreignField: "cnpj",
	 as : "fornecedor" } },
	 {$unwind: "$sw_instalados" }, 
     {$unwind: "$fornecedor" } ,
{$match : {"fornecedor.razão_social": /info/i }},
{$project : {"_id": 0 , "patrimonio": 1, "marca" : 1,
      "sw_instalados.nome" : 1, "sw_instalados.versão" : 1,
	  "softwares_instalados.dt_hora_instalação" : 1 ,
	  "fornecedor.razão_social" : 1 , "fornecedor.cnpj" : 1} ] )
// instalando um novo software no notebook 100
db.equipamento.findOne({patrimonio:100}) 
db.equipamento.updateOne({patrimonio:100},
{$push : 
   {"softwares_instalados" : 
{$each : [{software : "ORA21", dt_hora_instalação: new Date()}]}}})
// excluir a inserção errada do win11 - rever
//db.equipamento.updateOne({patrimonio:100 } ,
//{$pull : { "softwares_instalados" : [{"software": "DELETAR" , 
//"dt_hora_instalação" : ISODate("2023-09-25T10:43:49.176-03:00")}] } )
// atualizando
db.equipamento.updateOne({patrimonio:100, "softwares_instalados.software" : "WIN11"},
{$set : {"softwares_instalados.$.software" : "DELETAR" } } )
db.equipamento.find({patrimonio:100}) 

db.equipamento.find({patrimonio:100, 
"softwares_instalados.software" : "WIN11"} )	  


