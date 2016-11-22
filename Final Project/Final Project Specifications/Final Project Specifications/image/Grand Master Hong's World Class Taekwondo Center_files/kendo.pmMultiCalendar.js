(function ($) {
	var pmKendoMultiCalendar = {
		init: function (opts) {
			var self = this;
			var initialized = false;
			self.addClass("pm-multi-calendar");

			var options = {
				startDate: new Date(Math.min.apply(null, opts.selectedDates)),
				selectedDates: opts.selectedDates,
				countOfDatePickers: 2,
				changeHandler: opts.change,
				maxDate: opts.maxDate
			};

			var controlData = {
				startDate: options.startDate,
				values: values
			};
			self.data("pmKendoMultiCalendar", controlData);

			var kendoCalendars = [];
			for (var i = 0; i < options.countOfDatePickers; i++) {
			    var maxDate = new Date(options.startDate);
			    maxDate.setYear(maxDate.getFullYear() + 1);
			    var calendarElement = $("<div>");
				calendarElement.kendoMultiCalendar({
				    max: maxDate,
					values: $.extend([], options.selectedDates),
					footer: false,
					disableDates: function (date) {
					    if (!initialized || this.selectedMonth === undefined || !date) {
							return false;
						}

						return this.selectedMonth != date.getMonth();
					},
					change: function () {
						var selectedCalendar = this;
						var newValue = selectedCalendar.value();
						controlData.startDate = new Date(Math.min.apply(null, selectedCalendar.values()));
						var maxDate = controlData.startDate;
						maxDate.setYear(maxDate.getFullYear() + 1);
						kendoCalendars.forEach(function (kendoCalendar) {
							if (selectedCalendar != kendoCalendar) {
								var valueIndex = kendoCalendar.values().reduce(function (acc, value, index) {
									return isSameDate(value, newValue) ? index : acc;
								}, undefined);

								var calendarValues = $.extend([], kendoCalendar.values());
								if (valueIndex !== undefined) {
									calendarValues.splice(valueIndex, 1);
								    kendoCalendar.values(calendarValues);
								} else {
									kendoCalendar.values($.extend([], selectedCalendar.values()));
								}
							}
							kendoCalendar.options.max = maxDate;
						});
						controlData.startDate = new Date(Math.min.apply(null, selectedCalendar.values()));
						controlData.selectedDates = selectedCalendar.values();
						self.data("pmKendoMultiCalendar", controlData);
						if (options.changeHandler) {
							options.changeHandler();
						}
					},
					selectedMonth: options.startDate.getMonth() + i
				});
				var kendoMultiCalendar = calendarElement.data("kendoMultiCalendar");
				kendoCalendars.push(kendoMultiCalendar);
				if (i > 0) {
					kendoMultiCalendar.navigateToFuture();
				}
				self.append(calendarElement);
			}

			self.find(".k-calendar a.k-nav-fast").unbind();
			var prevBtn = self.find(".k-calendar:first-child a.k-nav-prev");
			
			prevBtn.click(function () {
				kendoCalendars.forEach(function (kendoCalendar, index) {
				    if (kendoCalendar) {
				        if (index > 0) {
				            if (prevBtn.hasClass("k-state-disabled") && kendoCalendar.options.selectedMonth - 1 == kendoCalendar.options.min.getMonth()) {
				                return;
				            } else {
				                kendoCalendar.navigateToPast();
				            }
				        }

				        if (prevBtn.hasClass("k-state-disabled") && kendoCalendar.options.selectedMonth == kendoCalendar.options.min.getMonth()) {
				            return;
				        } else if (kendoCalendar.options.selectedMonth == 0) {
				            kendoCalendar.options.selectedMonth = 11;
				        } else {
				            kendoCalendar.options.selectedMonth--;
				        }
					}
				});
			});

			var nextBtn = self.find(".k-calendar:last-child a.k-nav-next");
			nextBtn.click(function () {
				kendoCalendars.forEach(function (kendoCalendar, index, elements) {
				    if (kendoCalendar) {
				        if (index < elements.length - 1) {
				            if (nextBtn.hasClass("k-state-disabled") && kendoCalendar.options.selectedMonth == kendoCalendar.options.max.getMonth() - 1) {
				                return;
				            } else {
				                kendoCalendar.navigateToFuture();
				            }
				        }

				        if (nextBtn.hasClass("k-state-disabled") && kendoCalendar.options.selectedMonth == kendoCalendar.options.max.getMonth()) {
				            return;
				        } else if (kendoCalendar.options.selectedMonth === 11) {
				            kendoCalendar.options.selectedMonth = 0;
				        } else {
				            kendoCalendar.options.selectedMonth++;
				        }
					}
				});
			});

			function values(newValues) {
			    if (Array.isArray(newValues)) {
			        var maxDate = new Date(Math.min.apply(null, newValues));
			        maxDate.setYear(maxDate.getFullYear() + 1);
			        kendoCalendars.forEach(function(kendoCalendar) {
			            if (kendoCalendar) {
			                kendoCalendar.values(newValues);
			                kendoCalendar.options.max = maxDate;
			            }
			        });
			    }
			    return kendoCalendars[0].values();
			}
			initialized = true;
		}
	};

	function isSameDate(first, second) {
		return (
            first.getFullYear() === second.getFullYear() &&
            first.getMonth() === second.getMonth() &&
            first.getDate() === second.getDate()
        );
	}

	$.fn.pmKendoMultiCalendar = function (method) {
		if (pmKendoMultiCalendar[method]) {
			return pmKendoMultiCalendar[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return pmKendoMultiCalendar.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.pmKendoDialog');
		}
	}

	$.extend({
		pmKendoMultiCalendar: $.fn.pmKendoMultiCalendar
	});
})(jQuery);