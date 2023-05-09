import sql, { config } from 'mssql';
import * as book from './interfaces/Book'
import * as data from './interfaces/Data'
import * as Library from './interfaces/Library'
import * as Copy from './interfaces/Copy';

const conf: config = {
    user: 'intelligentSystem', // better stored in an app setting such as process.env.DB_USER
    password: 'LSS#2022', // better stored in an app setting such as process.env.DB_PASSWORD
    server: 'intelligent-system.database.windows.net', // better stored in an app setting such as process.env.DB_SERVER
    port: 1433, // optional, defaults to 1433, better stored in an app setting such as process.env.DB_PORT
    database: 'IntelligentBackpack', // better stored in an app setting such as process.env.DB_NAME
    options: {
        encrypt: true
    }
}


export async function getBookInfo(ISBN: string): Promise<book.Book> {
    let myBook = book.defaultBook()
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select * from Libro where ISBN='" + ISBN + "'"); //execute the query
        poolConnection.close(); //close connection with database
        if(resultSet.rowsAffected[0] == 0)
            return myBook;
        // ouput row contents from default record set
        resultSet.recordset.forEach(function(row: any) {
            row.Data_Pubblicazione = new Date(row.Data_Pubblicazione).toISOString()
            myBook = book.assignVals_JSON(row)
        });
        return myBook;
    } catch (e: any) {
        console.error(e);
    }
    return myBook
}

export async function addBook(myBook: book.Book): Promise<boolean> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("Insert into Libro values ('" + myBook.ISBN + "','" + myBook.Titolo + "','" + myBook.Autore + "', '" + data.exportDate(myBook.Data_Pubblicazione) + "')"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        return resultSet.rowsAffected[0] == 1;
    } catch (e: any) {
        console.error(e);
    }
    return false;
}

//TODO TESTARE
export async function registerLibrary(Email: string): Promise<boolean> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select count(ID) from Libreria"); //execute the query

        const numberOfElements = resultSet.rowsAffected[0] //get the number of elements

        var resultSet2:sql.IResult<any> = await poolConnection.request()
                                        .query("Insert into Libreria values (" + numberOfElements + ",'" + Email +"')"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        return resultSet2.rowsAffected[0] == 1;
    } catch (e: any) {
        console.error(e);
    }
    return false;
}

//TODO TESTARE
export async function getLibreriaByEmail(email: string): Promise<Library.Library> {
    let myLibrary = Library.defaultLibrary()
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select * from Libreria where Email_Proprietario= '" + email +"'"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        if(resultSet.rowsAffected[0] == 0)
            return myLibrary
        
        resultSet.recordset.forEach(function(row: any) {
            myLibrary = Library.assignVals_JSON(row)
        });
    } catch (e: any) {
        console.error(e);
    }
    return myLibrary;
}

//TODO TESTARE
export async function verifyRFIDExists(RFID: string): Promise<boolean> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet2:sql.IResult<any> = await poolConnection.request()
                                        .query("Select into Copia where RFID = ' " + RFID + "'"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        return resultSet2.rowsAffected[0] == 1;
    } catch (e: any) {
        console.error(e);
    }
    return false;
}

//TODO TESTARE
export async function buyBook(RFID: string, ISBN: string, ID_libreria: number): Promise<boolean> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("Insert into Copia values ('" + RFID + "'," + ISBN  + ", " + ID_libreria + ")"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        return resultSet.rowsAffected[0] == 1;
    } catch (e: any) {
        console.error(e);
    }
    return false;
}

//TODO TESTARE
export async function getCopyByEmail(Email: string): Promise<Copy.Copy> {
    let copia = Copy.defaultCopy();
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select * from Libreria, Copia where Copia.ID_Libreria=Libreria.ID AND Libreria.Email='" + Email + "'"); //execute the query
        poolConnection.close(); //close connection with database

        if(resultSet.rowsAffected[0] == 0) //se non è stata trovata nessuna libreria, torna quella default
            return copia;
        // ouput row contents from default record set
        resultSet.recordset.forEach(function(row: any) {
            copia = Copy.assignVals_JSON(row)
        });
        } catch (e: any) {
        console.error(e);
    }
    return copia;
}

//TODO TESTARE
export async function deleteLibraryByEmail(Email_Proprietario: string): Promise<boolean> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("delete from Libreria where Email_Proprietario='"+ Email_Proprietario + "'"); //execute the query
        poolConnection.close(); //close connection with database

        if(resultSet.rowsAffected[0] == 0) //se non è stata trovata nessuna libreria, torna quella default
            return false;
        // ouput row contents from default record set
        return true;
        } catch (e: any) {
        console.error(e);
    }
    return false;
}

//TODO TESTARE
export async function deleteRFID(RFID: string): Promise<boolean> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("delete from Copia where RFID='"+ RFID + "'"); //execute the query
        poolConnection.close(); //close connection with database

        if(resultSet.rowsAffected[0] == 0) //se non è stata trovata nessuna libreria, torna quella default
            return false;
        // ouput row contents from default record set
        return true;
        } catch (e: any) {
        console.error(e);
    }
    return false;
}

//TODO TESTARE
export async function deleteRFID_Email(Email_Proprietario: string): Promise<boolean> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        let libreriaID = (await getLibreriaByEmail(Email_Proprietario)).ID
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("delete from Copia where Id_Libreria="+ libreriaID); //execute the query
        poolConnection.close(); //close connection with database

        if(resultSet.rowsAffected[0] == 0) //se non è stata trovata nessuna libreria, torna quella default
            return false;
        // ouput row contents from default record set
        return true;
        } catch (e: any) {
        console.error(e);
    }
    return false;
}

//TODO TESTARE
export async function deleteBook_ISBN(ISBN: string): Promise<boolean> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("delete from Libro where ISBN='"+ ISBN + "'"); //execute the query
        poolConnection.close(); //close connection with database

        if(resultSet.rowsAffected[0] == 0) //se non è stata trovata nessuna libreria, torna quella default
            return false;
        // ouput row contents from default record set
        return true;
        } catch (e: any) {
        console.error(e);
    }
    return false;
}

//TODO TESTARE
export async function deleteBook_Author(Author: string): Promise<boolean> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("delete from Libro where Autore='"+ Author + "'"); //execute the query
        poolConnection.close(); //close connection with database

        if(resultSet.rowsAffected[0] == 0) //se non è stata trovata nessuna libreria, torna quella default
            return false;
        // ouput row contents from default record set
        return true;
        } catch (e: any) {
        console.error(e);
    }
    return false;
}