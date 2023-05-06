import sql, { config } from 'mssql';
import * as book from './interfaces/Book'
import * as data from './interfaces/Data'

const conf: config = {
    user: 'CloudSA665ece82', // better stored in an app setting such as process.env.DB_USER
    password: 'unibo99@23MLABDL', // better stored in an app setting such as process.env.DB_PASSWORD
    server: 'smartbaguniboserver.database.windows.net', // better stored in an app setting such as process.env.DB_SERVER
    port: 1433, // optional, defaults to 1433, better stored in an app setting such as process.env.DB_PORT
    database: 'smartbagDB', // better stored in an app setting such as process.env.DB_NAME
    options: {
        encrypt: true
    }
}


export async function getBookInfo(ISBN: number): Promise<book.Book> {
    let myBook = book.defaultBook()
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select * from Libro where ISBN=" + ISBN); //execute the query
        poolConnection.close(); //close connection with database

        if(resultSet.rowsAffected[0] == 0)
            return myBook;
        // ouput row contents from default record set
        resultSet.recordset.forEach(function(row: any) {
            myBook = book.assignVals_JSON(row)
        });
    } catch (e: any) {
        console.error(e);
    }
    return myBook
}

export async function addBook(myBook: book.Book): Promise<boolean> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("Insert into Libro values (" + myBook.ISBN + ",'" + myBook.Titolo + "','" + myBook.Autore + "', '" + data.exportDate(myBook.Data_Pubblicazione) + "')"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        return resultSet.rowsAffected[0] == 1;
    } catch (e: any) {
        console.error(e);
    }
    return false;
}