db.equipamento.insertOne(
    {patrimonio: 104,
    marca : 'Multilaser', tipo_eqpto: 'Periférico',
    características : {tipo: 'Mesa Digitalizadora', 
    resolução: '1600x900', tamanho_pol : 30} } )
    
    
    
//alocar outro periférico  no computador 100
db.equipamento.updateOne({ patrimonio: 100 },
    {$push: {perifericos_instalados: {
        patr_periferico: 104, dt_hora_instalação: new Date("2023-10-01")}
    }
})


