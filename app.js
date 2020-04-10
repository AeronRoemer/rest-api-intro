const express = require('express');
const app = express();
const records = require('./records')


//middleware is used each time a request comes in, hence the 'next' in middleware
app.use(express.json()); //middleware for requests incoming as JSON

/* Handler function to wrap each route. */
function asyncHandler(cb){
    return async(req, res, next) => {
      try {
        await cb(req, res, next)
        res.status(201)
      } catch(error){
        res.status(500).send(error);
      }
    }
  }

//send a GET request to view all quotes
app.get('/quotes', asyncHandler(async (req, res) =>{
    const quotes = await records.getQuotes();
    res.json(quotes) //converts to JSON object
}))
//send a GET request to view a single quote
app.get('/quotes/:id', asyncHandler(async(req, res) =>{
    const quote = await records.getQuote(req.params.id) //'params' pulls from URL params
    if(quote){
    res.json(quote) 
    } else {
        res.status(404).json({message: "Quote not found."})
    }
}))

//send a POST request to create a quote
app.post('/quotes', asyncHandler(async(req, res) =>{
    if(req.body.quote && req.body.author){
        const quote = await records.createQuote({
            quote: req.body.quote,
            author: req.body.author,
        }) 
        res.json(quote) 
        } else {
            res.status(404).json({message: "Please include both quote and author."})
        }
}))
//send a PUT request to edit a quote

app.put('/quotes/:id', asyncHandler(async(req, res) =>{
    const quote = await records.getQuote(req.params.id);
    if (quote){
        quote.quote = req.body.quote;
        quote.author = req.body.author;
        await records.updateQuote(quote);
        res.status(204).end(); //says that update went okay. ed() for PUT request

    } else {
        res.status(404).json({message: "Quote not found."})
    }

}))

//send a DELETE request to delete a quote

app.delete('/quotes/:id', async(req, res, next ) =>{
    const quote = await records.getQuote(req.params.id);
    try{
        throw new Error("Something happened")
        await records.deleteQuote(quote);
        res.status(204).end(); //says that update went okay. end() for DELETE request

    } catch(err) {
        next(err)
    }

})
//middleware at the bottom of the route is used only if the request doesn't match the 
//above requests
/* Error Handler to return JSON data instead of HTML for errors */
app.use((req, res, next) => {
    const error = new Error("Not Found!");
    error.status = 404;
    next(error); //passes into error handler
})

app.use((err, req, res, next) => {//error handler has 4th param
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message
        }
    })
})
app.listen(3000, () => console.log('Quote API listening on port 3000!'));
