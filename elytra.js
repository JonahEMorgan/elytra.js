Object.defineProperty(Node.prototype, "find", {
    get() {
    	var object = {};
    	var classes = new Set();
    	for(var element of this.getElementsByTagName("*")) {
            if(element.id)
        		Object.defineProperty(object, element.id, {
        			value: element
        		});
    		for(var className of element.classList)
    			classes.add(className);
    	}
    	for(var className of classes)
    		if(!className in object)
    			Object.defineProperty(object, className, {
    				value: this.getElementsByClassName(className)
    			});
        return object;
    }
});

Object.defineProperty(Node.prototype, "text", {
    get() {
        return value => this.textContent = value;
    }
});

var elytra = (() => {
    var watch = model => {
        var properties = Object.keys(model);
        model._values = {};
        model._watchers = {};
        for(let property of properties)
            if(typeof model[property] === "object")
                watch(model[property]);
            else {
                model._values[property] = model[property];
                Object.defineProperty(model, property, {
                    set(value) {
                        model._values[property] = value;
                        if(property in model._watchers)
                            model._watchers[property](value);
                    },
                    get() {
                        var object = {};
                        Object.defineProperty(object, "value", {
                            get: () => model._values[property],
                            set: value => model[property] = value
                        });
                        Object.defineProperty(object, "watcher", {
                            get: () => model._watchers[property],
                            set(value) {
                                model._watchers[property] = value;
                                value(model._values[property]);
                            }
                        });
                        return object;
                    }
                });
            }
    };

    var reset = (current, template, ignore) => {
        for(var property in template)
            if(property in current && !ignore.includes(property))
                if(property in current._values)
                    current[property] = template[property];
                else if("_values" in current[property])
                    reset(current[property], template[property]);
    };

    var configure = (object, config) => {
        for(var property in config)
            if(property in object)
                if(typeof config[property] == "object")
                    configure(object[property], config[property]);
                else
                    object[property] = config[property];
    };

    var component = (element, config) => {
        if("props" in config)
            for(var property of config.props)
                Object.defineProperty(element, property, {
                    get: () => element.getAttribute(property),
                    set: value => element.setAttribute(property, value)
                });
        if("config" in config)
            configure(element, config.config);
        if("init" in config)
            if(config.init.length > 0)
                element.innerHTML = config.init(element.innerHTML);
            else
                config.init();
    }

    return {
        add(name, model) {
            var copy = JSON.parse(JSON.stringify(model));
            watch(model);
            Object.defineProperty(model, "reset", {
                value(...ignore) {
                    reset(this, copy, ignore);
                }
            });
            Object.defineProperty(this, name, {
                value: model
            });
        },
        component(name, config) {
            for(var element of document.getElementsByTagName(name))
                component(element, config);
            var observer = new MutationObserver((records, _) => {
                for(var node of records[0].addedNodes)
                    if(node instanceof HTMLElement)
                        if(node.tagName.toLowerCase() == name.toLowerCase())
                            component(node, config);
            });
            observer.observe(document, {
                subtree: true,
                childList: true
            });
        }
    };
})();

