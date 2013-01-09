var Mysql = {
	STRING: 'varchar',
	INTEGER: 'int',
	TEXT: 'text',
	TIMESTAMP: 'timestamp',
	DATETIME: 'datetime',
	DATE: 'date',
	CURRENT_TIMESTAMP: 'CURRENT_TIMESTAMP'
}

var model = {
	usr: {
        uid: { type: Mysql.INTEGER, allowNull: false, index: true, validate: { max: 11 } },
        fb_id: { type: Mysql.STRING, allowNull: false, primary: true, validate: { max: 65 } },
        source: { type: Mysql.STRING, allowNull: true, index: true, validate: { max: 64 } },
        email: { type: Mysql.STRING, allowNull: true, index: true, validate: { max: 256 } },
        firstname: { type: Mysql.STRING, allowNull: true, index: true, validate: { max: 64 } },
        lastname: { type: Mysql.STRING, allowNull: true, index: true, validate: { max: 64 } },
        birthdate: { type: Mysql.DATE, allowNull: true, index: true },
        civility: { type: Mysql.STRING, allowNull: true, index: true, validate: { max: 5 } },
        address: { type: Mysql.STRING, allowNull: true, validate: { max: 128 } },
        postcode: { type: Mysql.STRING, allowNull: true, validate: { max: 10 } },
        city: { type: Mysql.STRING, allowNull: true, validate: { max: 64 } },
        country: { type: Mysql.STRING, allowNull: true, validate: { max: 32 } },
        lang: { type: Mysql.STRING, allowNull: true, validate: { max: 12 } },
        telephone: { type: Mysql.STRING, allowNull: true, validate: { max: 16 } },
        passport_valid: { type: Mysql.INTEGER, allowNull: true, validate: { max: 1 } },
        photo_full: { type: Mysql.TEXT, allowNull: true, json: true},
        photo_portrait: { type: Mysql.TEXT, allowNull: true, json: true},
        personality: { type: Mysql.TEXT, allowNull: true},
        accept_terms: { type: Mysql.INTEGER, allowNull: true, validate: { max: 1 } },
        created_at: { type: Mysql.DATETIME, allowNull: true },
        updated_at: { type: Mysql.DATETIME, allowNull: true },
        submited_at: { type: Mysql.DATETIME, allowNull: true },
        starred: { type: Mysql.INTEGER, allowNull: true, validate: { max: 1 } },
        ua: { type: Mysql.STRING, allowNull: true, validate: { max: 256 } },
        browser: { type: Mysql.STRING, allowNull: true, validate: { max: 256 } },
        ip: { type: Mysql.STRING, allowNull: true, validate: { max: 32 } },
        errors: { type: Mysql.STRING, allowNull: true, validate: { max: 256 } }
    }
}

module.exports = model;