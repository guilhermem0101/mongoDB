use imdb_bd2
db.movie.find()
db.actor.find()

//renomenado um campo
db.movie.updateMany(
  {}, 
  {$rename: {"year": "ano_lancamento"}}
)

db.movie.aggregate([ 
  { "$project": { "dataType": {  "$type": "$ano_lancamento"  } } } ]
)

//verificação e contagem de tipos de dados por coluna
db.movie.aggregate([
  {$project: {"dataType": {"$type": "$ano_lancamento"}}},
  {$group: {
      "_id": "$dataType", // Campo de agrupamento
      "quantidade": { "$sum": 1 } // Operação de contagem
    }
  }
])


//verificação e contagem de tipos de dados por coluna
db.movie.aggregate([
  {$project: {"dataType": {"$type": "votos"}}},
  {$group: {
      "_id": "$dataType", // Campo de agrupamento
      "quantidade": { "$sum": 1 } // Operação de contagem
    }
  }
])

// cria nova coluna
db.movie.updateMany(
    {}, 
    {$set : {duracao: null}
    }
)
//filtra ejoga os dados de uma coluna para outra
db.movie.updateMany(
  {runtime: {$ne: null}}, //filtragem 
  [{ $set: // seta um campo
    {duracao: 
        {$substr: // extrai uma substring de uma string
          ["$runtime", 0, { $indexOfBytes : ["$runtime", " min"] }] //remove o min de runtime
         } 
    }}
  ] 
)



//contando quantos anos de lançamento são == null 
db.movie.find({ano_lancamento:{$eq: null}}).count()


//para cada documento selecionado, executa uma ação
db.movie.find({ano_lancamento:{$ne: ""}}).forEach( function (doc) {
    doc.ano_lancamento = parseInt(doc.ano_lancamento)
    db.movie.save(doc)
});


db.movie.find({duracao:{$ne: ""}}).forEach( function (doc) {
    doc.duracao = parseInt(doc.duracao)
    db.movie.save(doc)
});


db.movie.createIndex(
  { title: 1, ano_lancamento: -1 },
  { name: "titulo_ano" }
)
  
  
  
// medidas do conjunto duração 
db.movie.aggregate(
    {$match: {duracao:{$ne: NaN}}}
    {$group:{_id: null ,  // campo de agrupamento
        maior_duração : {$max: "$duracao" },
        menor_duração : {$min: "$duracao" },
    	media_duração : {$avg: "$duracao" },
    	total : {$count: {}}
        }
    } 
) 
  
  
//agregação por ano de lançamento
db.movie.aggregate(
    {$group:{
        _id: "$ano_lancamento",  // campo de agrupamento
        quantidade : {$count: {}} // contagem por ano de lançamento 
    } 
    },
	{$sort : {_id: -1 }} 
)


// agrupando por mais de um campo
db.movie.aggregate([
    {$match : {countries : /usa/i}},// where
    {$unwind: "$genre" },
    {$group:{_id: {genero: "$genre", ano:"$ano_lancamento"},
        qtos_filmes_genero_ano: {$count: {}} }
    },
    {$match: {qtos_filmes_genero_ano: {$gte: 5}}},//having
    {$sort : {qtos_filmes_genero_ano:-1}} 
])



//A
db.movie.aggregate([
  { $unwind: "$directors" }, //transforma um documento para cada diretor no vetor
  { $group: { _id: "$directors", filmes_qtd: {$count: {}} } }, // contagem por diretor
  { $match: {filmes_qtd: {$lte: 2}}}, // diretores com no maximo 2 filmes
  { $project: { diretor: "$_id", filmes_qtd: 1, _id: 0 } }
])

//B
db.movie.aggregate([
    { $unwind: "$countries" },
    { $unwind: "$languages" },
    { $group: {_id: {país:  "$countries", idioma:  "$languages" },
          qtd_pais_linguagem: {$count: {}}
        }
    },
    { $sort : {qtd_pais_linguagem:-1}},
    { $project: {_id: 0, país: "$_id.país", idioma: "$_id.idioma", qtd_pais_linguagem: 1 }}
])

//C
db.movie.aggregate([
  { $unwind: "$genre" }, 
  { $unwind: "$actors" },
  { $match: {actors: /Robert de Niro/i}},
  { $group: { _id: "$genre", filmes_qtd: {$count: {}} } }, // contagem por genero
  { $sort : {filmes_qtd:-1}}
])


//D 
// cria nova coluna votos
db.movie.updateMany(
    {}, 
    {$set : {votos: null}
    }
)


//filtra e joga os dados da coluna votes para votos
db.movie.updateMany(
  { votes: { $ne: null } },
  [{ $set: 
    { votos: 
        { $toInt: {
            $replaceAll: { input: "$votes", find: ",", replacement: ""}
          }
        }
      }
    }]
)


db.movie.aggregate([
  { $unwind: "$genre" }, // Separar os gêneros em documentos individuais
  {$group: {
      _id: "$genre", // Agrupar por gênero
      totalVotos: { $sum: { $convert: { input: "$votos", to: "int", onError: 0, onNull: 0 } } }
    }
  },
  { $match: { totalVotos: { $gte: 10000 } } },
  { $sort : {totalVotos:-1}}
])




