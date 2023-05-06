import sql, { config } from 'mssql';

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

export async function findUserWithEmail() {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select * from Libro"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        resultSet.recordset.forEach(function(row: any) {
            //console.log(JSON.stringify(row))
        });
    } catch (e: any) {
        console.error(e);
    }
}