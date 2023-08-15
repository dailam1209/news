const New = require("../models/NewModel");

exports.add = async (req, res) => {
    try {
        const { name, url, image} = req.body;
        if(name && url && image) {
           const newsApi = await New.create({
                name,
                url, 
                image
            })
            res.status(200).json({
                success: true,
                newsApi
            })
        }
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

exports.getNews = async (req, res) => {
    try {
        const listNew = await New.find();
        res.status(200).json({
            success: true,
            listNew
        })
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}