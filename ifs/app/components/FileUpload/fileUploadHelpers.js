var path = require('path');
var mkdirp = require('mkdirp');
var fs = require('fs');
var _ = require('lodash');
const execSync = require('child_process').execSync;

var Logger = require( __configs + "loggingConfig");
var Errors = require(__components + "Errors/errors");

module.exports =  {

   /* Helper functions */
    getYearMonthDayStr:function (){
        var dateObj = new Date();
        var arr = [ dateObj.getFullYear(), dateObj.getMonth() + 1, dateObj.getDate()];
        return arr.join('-');
    },

    replaceExt: function( filename, newExt ) {
      var ext = path.extname(filename);
      console.log(ext);
      return filename.replace(ext, newExt);
    },

    getExt: function ( filename ) {
        if(!filename)
            return "";

        var extId = filename.lastIndexOf(".");
        return (extId >= 0 ? filename.substr(extId+1) : "");
    },

    // This checks zip, tar and tz. (Only tested zip)
    isZip: function (filename) {
        var ext = path.extname(filename);
        return  ext == ".zip" || ext == ".tar" || ext == '.gz';
    },
    // This check .odt, .docx and .doc  files
    isDoc: function ( filename ) {

        var ext = path.extname(filename);
        return  ext == ".doc" || ext == ".docx" || ext == '.odt';
    },

    isSrcExt: function( filename ) {
        var ext = ['c', "cpp", "cc"];
        return _.includes(ext, this.getExt( filename) );
    },

    validateProgrammingFiles: function( filesInfo ) {

        // Check only one file for zip submission
        var countZip = 0, countSrc = 0;
        for( var i = 0; i < filesInfo.length; i++) {
            if( this.isZip(filesInfo[i].filename) )
                countZip++;
            else if( this.isSrcExt(filesInfo[i].filename) )
                countSrc++;
        }

        if( countZip > 1 || (countZip == 1 && filesInfo.length > 1) ) {
            return Errors.cLogErr("Invalid submission, please submit one file for zip files.");
        }

        if( countZip == 0 && countSrc == 0 )
            return Errors.cLogErr("Invalid submission, please submit one source file.");
        return {};
    },

    validateWritingFiles: function( filesInfo ) {
        //TODO Nothing for now
        return {};
    },

    // This funciton mimicks what would happen if students submitted via a zip file.
    // Place everything in another folder, could eventually even move certain files
    // too appropriate directories ( if needed )
    createProgrammingProject: function( filesInfo, options ) {

        if(filesInfo.length >= 1) {

            options = options || {'dir':'/unzipped'};
            var directory = filesInfo[0].destination;
            console.log(directory);
            var zipDir = path.join( directory, options['dir']);
            console.log("************************************", zipDir);
            var folderCreated = mkdirp.sync( zipDir );
            Errors.cl(folderCreated);

            if( folderCreated ) {
                try {
                    for( var i = 0; i < filesInfo.length; i++ ) {
                        var call ="mv " + filesInfo[i].filename + " " + zipDir
                        execSync( call );
                    }

                    // These will point to the directory and be handled later.
                    // Destroy the original array and replace with a single instance to directory.
                    filesInfo = [ { 
                        'filename': zipDir,
                        'originalname': zipDir,
                        'destination': directory,
                        'path': 'directory',
                    }];
                    return filesInfo;
                }
                catch(e) {
                    return Errors.cErr("Cannot copy source files provided");
                }
            }
            else {
                Errors.cl( zipDir );
                return Errors.cErr("Can not create programming create folder");
            }
        }
    },

    /* Wrapper for all file types handling
        Function should take files array (containing basic info for each file)
        Check that unzipping and conversions can function
        update file names to appropritate names (doc changes to text)
        otherwise leave file information unchanged.
        Note: You can/should only handle the fileInfo once.
    */
    handleFileTypes: function( req, res ) {

          // Get files names to be inserted
        var uploadedFiles = this.getFileNames( req.files );

        if( !uploadedFiles || uploadedFiles.length == 0 )
        {            
            var e = Errors.cLogErr( "Unable to process uploaded files" );
            return e;
        }

        var toolType = req.session.toolSelect;
        console.log("Handle files", toolType);
        if( toolType == "Programming") {

            console.log("Handle files validate");
            var validate = this.validateProgrammingFiles( uploadedFiles );
            if( Errors.hasErr(validate) ) {
                Errors.logErr(validate);
                return validate;
            }

            console.log("Handle files post validate");

            var fileInfo = uploadedFiles[0];
            var res = this.handleZipFile( fileInfo );
            if( Errors.hasErr(res) ) {
                // Could not handl zipped format.
                Errors.logErr(res);
                return res;
            }
            else if( _.has(res,'res') ) {
                // Get the directory information                
                 fileInfo = res.res;
            }
            else {
                console.log("creating a proggramm directory");
                uploadedFiles = this.createProgrammingProject(uploadedFiles);
            }
        }
        else if( toolType == "Writing") {
            var validate = this.validateWritingFiles( uploadedFiles );
            if( Errors.hasErr(validate) ) {
                Errors.logErr(res);
                return validate;
            }   
            for( var i = 0; i < uploadedFiles.length;i++) {
                var fileInfo = uploadedFiles[i];
                res = this.handleDocxFile( fileInfo );
                if( Errors.logErr(res)) {
                    // TODO: we need to stop
                    Errors.logErr(res);
                    return res;
                }
                else if(_.has(res,'res')  ){
                    //  file was handled
                    fileInfo = res.res;
                }
            }
        }

        console.log("File information is ", uploadedFiles );
        return uploadedFiles;
    },

    separateFiles: function( files, fileTypes) {
        var res = {}
        console.log("Seperate files");
        for( var i = 0; i < files.length; i++ ) {
            var ext = this.getExt( files[i] );
            if( _.includes(fileTypes, ext) ){
                console.log("here1");
                if(_.includes(res, ext) ) {
                    console.log("here");
                    res[ext].push( files[i] )
                }
                else
                    res[ext] = [ files[i] ] ;
            }          
        }
        console.log("res:", res );
        return res;
    },


    findFilesSync: function( startDir ) {

        console.log("HERE FFS", startDir );
        if( !fs.lstatSync(startDir).isDirectory() ) {
            return Errors.cLogErr("Directory:" + startDir + " does not exists");
            
        }
        console.log("FindFiles");

        var arr = [];
        var files = fs.readdirSync(startDir);
        for( var i = 0; i < files.length; i++ ) {
            var filename = path.join( startDir, files[i] );
            var stat = fs.lstatSync(filename);
            if( stat.isDirectory() ) {
                arr = arr.concat( this.findFilesSync( filename ) );
            }
            else
                arr.push( filename );
        }
        return arr;
    },

    handleZipFile: function ( fileInfo )
    {
        var res = {};
        var zipfile = fileInfo.filename;
        if( zipfile && this.isZip(zipfile) ){

            //TODO: This has only been tested with zip.
            console.log("Here\nZipFiles:", zipfile );
            var zipDir = path.join( path.dirname(zipfile), '/unzipped');
            try {
                console.log("Print the unarchieve");
                console.log("Print the unarchieve2");
                var unarc = this.unarchieve( zipfile, {'dir':zipDir} );
                console.log("Print NEXT");
                if( Errors.ifErrLog(unarc) ) {
                    return unarc;
                }
                else {
                    console.log("Inside success");
                    var files = this.findFilesSync(zipDir);
                    console.log( files );

                    var fileGroups = _.groupBy(res, this.getExt);

                    console.log( fileGroups );
                    console.log("PLEASE VALIDATE YOUR WORK");

                    if( fileGroups ){
                        var isValidProject = this.validateProjectStructure(fileGroups);
                        if( Errors.ifErrLog(isValidProject) )
                            return isValidProject

                        // These will not point to the proper directory.
                        fileInfo.filename = zipDir;
                        fileInfo.originalname = zipDir;
                        res = { res: zipDir };

                        console.log("FINISHED VALIDATE");
                    }
                }
            }
            catch(err) {
                var emsg =  "Unable to extract : " + fileInfo.originalname;
                Logger.error(err.name + ': ' + err.message);
                res.err = { msg:emsg };
            }
        }
        return res;
    },


    // This function takes the isDoc type and creates a .txt file with the same name
    // and in the same folder.
    // (TODO) Error is logged but not handled.
    handleDocxFile: function ( fileInfo )
    {
        var res = {};
        var filename = fileInfo.filename;
        if( filename && this.isDoc(filename) )
        {
            console.log("Handling docx file types", filename );
            var childProcess = require('child_process');
            var outDir = path.dirname(filename);
            var args =  [ "--headless", "--convert-to","txt:Text", filename, '--outdir', outDir ];

            // This call soffice (Libra to handle conversion)
            var convertToTxt = childProcess.spawnSync('soffice', args );

            if(convertToTxt.error) {
                var e = Errors.cLogErr("Unable to convert document file: " + fileInfo.originalname);
                return e;
            }
            else {
                // Make the text file the reference file instead of .doc
                fileInfo.filename = this.replaceExt(fileInfo.filename, ".txt");
                fileInfo.originalname = this.replaceExt(fileInfo.originalname, ".txt");
                res = { res: fileInfo };
            }
        }
        return res;
    },

    /* Function will un-archieve a zip or gz file 
        By Default: will create a new folder unzipped and extract to it.
    */
    unarchieve: function ( file, options ) {
        console.log("START");
        options = options || {};
        options.dir = options.dir || "./unzipped";
        var res = {}
        try {
            console.log("Inside UNARC");
            var call = "";
            var folderCreated = false;
            console.log( "FILE is :", file, ":");
            var ext = this.getExt(file );
            console.log("Check ext");
            
            if( ext == 'gz') {
                folderCreated = mkdirp.sync( options.dir );
                options.params = options.params || "-xzf";
                call = "tar " + options.params + " " + file + " -C " + options.dir;
            }
            else if( ext == 'zip')  {
                console.log("IS ZIP");
                folderCreated = true;
                options.params = options.params || " -q ";
                call ="unzip " + options.params + file + " -d " + options.dir;
                console.log("call would be:", call );
            }
            console.log(" About to make: ", call );
            if( folderCreated ) {
                execSync( call );
            }
            else {
                throw Errors.cLogErr("Unable to unzip project folder.");
            }
        }
        catch ( e ) {
            var e = Errors.cErrLog("Unable to extract files: " + file);
            return e;
        }

        return {};
    },

    // Minor validation of the project, including checking for a makefile, *c and *.h files
    validateProjectStructure: function ( zipDir, groupedFiles ) {

        var res = {};
        if( groupedFiles ) {
            var noExts = _.get(groupedFiles, "");
            var makeFile = path.join(zipDir,'Makefile');
            var hasMakeFile = _.includes(noExts, makeFile) || _.includes(noExts, _.lowerCase(makeFile) );

            if( !noExts || !hasMakeFile ) {
                return Errors.cLogErr("Unable to identify project makefile, please ensure file you've included a makefile at the top level of your project.");
            }

            var cFiles = _.get(groupedFiles,"c");
            var hFiles = _.get(groupedFiles,'h');

            if( !cFiles ) {
                return Errors.cLogErr("Unable to locate source (.c) files in project.");
            }
            
            if( !hFiles )  {
                return Errors.cLogErr("Unable to locate header (.h) files in project.");
            }
        }
        //Everything looks ok.
        return {};
    },

    // This function gets the file names from Multer, appends the uploads directory
    // and keeps only the "likely" required keys for future processing.
    getFileNames: function ( files ) {
        // Retrieve all files original name and new server name
        var keys = [ 'originalname', 'filename','destination'];
        var uploadedFiles = _.map( files, obj => _.pick(obj, keys) );

        // Append uploads directory.
        _.forEach( uploadedFiles, function(f ){
            _.update(f, 'filename', obj => f.destination + "/" +  f.filename);
        });
        return uploadedFiles;
    },

    writeResults: function( obj, options ) {
        var filename = options.file;
        var uploadDir = path.dirname(  options.filepath );
        var file = path.join(uploadDir,filename);
        Logger.info("Writing", file, "now", file);
        fs.writeFileSync( file , JSON.stringify(obj), 'utf-8');
        return file;
    },

    // This function mimicks the file object provided by Multer
    // If more fields are discovered to be useful just add them.
    createFileObject: function( filename ) {
        return {
            'originalname': path.basename(filename),
            'filename':filename,
            'content': '',
        };
    }
};