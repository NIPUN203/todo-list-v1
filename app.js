const express=require("express");
const bodyparser=require("body-parser");
const app=express();
const mongoose=require('mongoose');
mongoose.connect("mongodb://localhost:27017/todolistDB");
const date=require(__dirname+"/date.js")
const _=require('lodash');
const itemsSchema=new mongoose.Schema({
  Name:String
});

const listSchema=new mongoose.Schema({
  Name:String,
  items:[itemsSchema]
});


const Item=mongoose.model("item",itemsSchema);
const List=mongoose.model("list",listSchema);

const item1=new Item({
  Name:"Welcome to my ToDo list"
});

const item2=new Item({
  Name:"Click + to add a new task"
});

const item3=new Item({
  Name:"<-- Click this to delete an item"
});

const defaultitems=[item1,item2,item3];



app.use(bodyparser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(express.static("CSS"));
// let items=["Buy Food","Cook Food","Eat Food"];
let work_items=[];
// items=defaultitems;
// var today=new Date().getDay();
//Get
app.get("/",(req,res)=>{
  let day=date.getdate();

  Item.find((err,foundItems)=>
  {
    if(err) console.log("An error occurred.");
    else {
      if(!foundItems.length){
      Item.insertMany(defaultitems,(error)=>{
          if(error)
          console.log("Some error occured.");
          else console.log("Successfully inserted.");
        });
        res.redirect("/");
      }
else
      res.render("index",{List_title:"TODAY",new_items:foundItems});
    }
  });


  // res.render("index",{List_title: day , new_items: items});
})

// custom get
app.get("/:customListName",(req,res)=>
{
  let custom=_.capitalize(req.params.customListName);
  console.log(custom);
  const list=new List({
    Name:custom,
    items:defaultitems
  });
  List.find({Name:custom},(err,results)=>{
  if(err) console.log("An Error Occurred couldnt find")
  else {
    if(!results.length){
      list.save();
      res.redirect("/"+custom);
    console.log(results);}
    else{
      console.log(results);
      res.render("index",{ List_title:custom,new_items:results[0].items});
    }
  }
});
  // res.render("index",{List_title:custom,new_items:[]});
});

// app.get("/work",(req,res)=>{
//   res.render("index",{List_title: "Work List",new_items: work_items});
// });;
//
// app.get("/about",(req,res)=>
// {
//   res.render("about",{Name:"NIPUN",Number:"6395402081"});
// });

//Post
// app.post("/work",(req,res)=>{
// let item=res.body.add;
// work_items.push(item);
// console.log(work_items);
// res.redirect("/work");
// });

app.post("/",(req,res)=>
{
  let item_name=req.body.add;
  let list=req.body.list;
  let item=new Item({
    Name:item_name
  });
  if(list==="TODAY")
  {
  item.save();
  res.redirect("/");
  }
  else
  List.findOne({Name:list},(err,result)=>
{
  if(err) console.log("ERROR");
  else {
    // console.log(result);
    result.items.push(item);
    result.save();//to save the data inserted in the above line.
    res.redirect("/"+list);
  };
})

// if(req.body.list==="Work List"){
// work_items.push(item);
// res.redirect("/work");}
// else{
//   defaultitems.push(item);//just to add all the new items everytime a post req is made.
//   let item0=new Item({
//     Name:item});
//   item0.save();//Saving a new item into DB for APP.
//   res.redirect("/");}//what this redirect does is, it allows us to continously take
//   //data in the site and then post the data to the site.
//   console.log(defaultitems);
});

//Delete the completed item or task.
app.post("/delete",(req,res)=>
{
  const checked_item=req.body.checkbox;
  const listname=req.body.listname;

      if(listname=="TODAY")
      {
        console.log(checked_item);
        Item.deleteOne({_id:checked_item},(err)=>
        {
        if(err) console.log("Some error occurred.");
        else console.log("Successfully deleted the record.");
        });
        res.redirect("/");
      }
      else
      {
          List.findOneAndUpdate({Name:listname},{$pull: {items: {_id: checked_item }}},(err,result)=>{
            if(!err)
            {
              console.log("deleted");
              res.redirect("/"+listname);
              // res.redirect("/"+listname);
            }
          });
      }

});

const port=process.env.PORT;
app.listen(port,()=>{console.log("Server has started.");})
