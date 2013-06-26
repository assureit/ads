declare module 'config' {
    class Config {
        watch(object, property, handler, depth);
        setModuleDefaults(moduleName, defaultProperties);
        makeHidden(object, property, value);
        makeImmutable(object, property, value);
        watchForConfigFileChanges(interval);
        getOriginalConfig();
        resetRuntime(callback);
        // _persistConfigsOnChange(objectToWatch);
        // _loadFileConfigs();
        // _parseFile(fullFilename);
        // _attachProtoDeep(toObject, depth);
        // _cloneDeep(obj, depth);
        // _equalsDeep(object1, object2, depth);
        // _diffDeep(object1, object2, depth);
        // _extendDeep(mergeInto);
        // _stripYamlComments(fileStr);
        // _stripComments(fileStr);
        // _isObject(obj);
    }
}
