// Atividade 2
//a)	Insira uma nova empresa fornecedora com razão social, tipo, cnpj, endereço (com campos para cada característica) e fone com campos para ddd e número.
db.empresa.insertOne({razao_social : 'Faisca Equipamentos e Software Ltda ', cnpj: 22334455, tipo_empresa : 'Fornecedor',
endereço : {rua : 'Cerro Corá', numero : 1000, bairro : 'Lapa', cidade : 'São Paulo'},
fone :  [{DDD: 11, numero : 995001234} , {DDD: 11, numero : 957890000}] })

db.empresa.find({razao_social: /Fa.*sca/i})

db.empresa.deleteOne({razao_social: /Fa.*sca/i})

//b)	Após incluir o novo documento atualize o bairro da empresa.
db.empresa.updateOne({razao_social: /Fa.*sca/i}, {$set: {"endereço.bairro" : 'Alto da Lapa'}})

//c)	Inclua um novo número de telefone e posteriormente atualize este número.
db.empresa.updateOne({razao_social: /Faisca/i}, 
{$push: {"fone": {$each: [{DDD:11, numero: 11990987654}] } } } )
db.empresa.updateOne(
    {razao_social: /Fa.*sca/i, "fone.numero" : 11990987654 },
    {$set: {"fone.$" : {DDD:11, numero: 990987622}}})

//d)	Mostre razão social, endereço e fones de empresas que não estão localizadas no bairro Lapa.
db.empresa.find({$and: [ 
    {endereço: {$not: /lapa/i }}, 
    { "endereço.bairro" : {$not: /lapa/i } } ] },
    {_id : 0 , razão_social : 1 , endereço : 1 , fone: 1 , fones: 1 })


// e)	Mostre os mesmos dados de d) mas para as empresas que tenham a palavra
// Equipamento na razão social, 
// mas que não se localizem em cidades com nome de santo (São, Santo, Santa).
db.empresa.find({$and: [ {razao_social : /equipamento/i}, 
                         {endereço: {$not: /sant/i }} ,
                         { "endereço.cidade" : {$not: /sant/i }},
                         {endereço: {$not: /s.*o/i }} ,
                         { "endereço.cidade" : {$not: /s.*o/i }} ] },
{_id : 0 , razão_social : 1 , "endereço.cidade": 1, fone: 1 , fones: 1 })