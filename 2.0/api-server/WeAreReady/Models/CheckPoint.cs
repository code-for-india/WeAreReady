//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace WeAreReady.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class CheckPoint
    {
        public CheckPoint()
        {
            this.Logs = new HashSet<Log>();
        }
    
        public int CheckPointId { get; set; }
        public string CheckPointName { get; set; }
        public int TypeOfCheckPoint { get; set; }
        public Nullable<double> Lattitude { get; set; }
        public Nullable<double> Longitude { get; set; }
    
        public virtual ICollection<Log> Logs { get; set; }
    }
}
