fetch("https://pokeapi.co/api/v2/pokemon/pikachu")
.then(res => res.json())
.then(data => {
    console.log(data)
})